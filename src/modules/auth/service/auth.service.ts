import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRequestDto } from 'src/common/dtos/auth/login.dto';
import { createUserDto } from 'src/common/dtos/user/user.dto';
import { UserEntity } from 'src/database';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from 'src/config/auth/refreshJwt.config';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/modules/user/service/user.service';
import * as argon2 from 'argon2';
import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { sendEmailDto } from 'src/common/dtos/auth/email.dto';
import { hashPassword, randomToken, timeOfExistence } from 'src/utils';
import {
  ChangePasswordDto,
  forgotPasswordDto,
} from 'src/common/dtos/auth/password.dto';
import { SecretOtp } from 'src/types/user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,

    // Đúng: inject CACHE_MANAGER vào cacheManager
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    // Đúng: inject config của refreshJwtConfig
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  private async sendVerificationEmail(
    to: string,
    token: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to Nice App! Confirm your Email',
      html: `
        <p>Hey ${to},</p>
        <p>Your code is <strong>${token}</strong>. It expires in 15 minutes.</p>
      `,
      context: {
        text: `Mã của bạn là ${token}. Hết hạn sau 15 phút.`,
      },
    });
  }

  async register(formData: createUserDto) {
    const storedCode = await this.cacheManager.get<SecretOtp>('info');
    if (!storedCode?.token.includes(formData.keyConfirmEmail)) {
      throw new ConflictException(
        'The verification code does not exist or has expired.',
      );
    } else if (!storedCode?.email.includes(formData.email)) {
      throw new ConflictException('Incorrect email');
    }

    try {
      const user = this.userRepository.create({
        ...formData,
        password: await hashPassword(formData.password),
      });
      const result = await this.userRepository.save(user);
      await this.cacheManager.del('info');
      return {
        message: 'Register account successfully',
        data: result,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Create account error');
    }
  }

  async login(body: LoginRequestDto) {
    const user = await this.findUserByEmail(body.email);

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      throw new ConflictException('Password is incorrect now');
    }

    const { accessToken, refreshToken } = await this.generateToken(user.id);
    const hashedRt = await argon2.hash(refreshToken);

    await this.userRepository.update(user.id, { hasTokenRefresh: hashedRt });

    return {
      message: 'Account login successful',
      data: { user, accessToken, refreshToken },
    };
  }

  async generateToken(userId: number) {
    const payload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload),
      this.jwtService.sign(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(id: number) {
    await this.findUserById(id);

    const { accessToken, refreshToken } = await this.generateToken(id);
    const hashedRefreshToken = await argon2.hash(accessToken);
    await this.updateHashedRefreshToken(id, hashedRefreshToken);

    return {
      message: 'Refresh token successful',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: any) {
    return await this.userRepository.update(
      { id: userId },
      { hasTokenRefresh: hashedRefreshToken },
    );
  }

  async validateJwtUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const currentUser = { id: user.id, role: user.role };
    return currentUser;
  }
  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.hasTokenRefresh)
      throw new NotFoundException('Invalid Refresh Token');

    const refreshTokenMatches = await argon2.verify(
      user.hasTokenRefresh,
      refreshToken,
    );

    if (!refreshTokenMatches)
      throw new NotFoundException('Invalid Refresh Token');

    return { id: userId };
  }

  async sendUserConfirmation(body: sendEmailDto) {
    const token = randomToken(); // OTP 6 chữ số
    const user = await this.findUserByEmail(body.email);

    await this.cacheManager.set(
      'info',
      {
        token,
        email: body.email,
      },
      15 * 60 * 1000,
    );

    const expiresAt = timeOfExistence(); // 15 phút
    await this.sendVerificationEmail(user.email, token);

    return {
      message: 'Confirmation email sent',
      data: {
        expiresAt,
      },
    };
  }

  async sendOtpVerifyPassword(body: forgotPasswordDto) {
    await this.findUserByEmail(body.email);
    const token = randomToken(); // OTP 6 chữ số
    const hashPass = await hashPassword(token);
    if (!hashPass) {
      throw new ConflictException('OTP code error');
    }
    const expiresAt = timeOfExistence();

    await this.sendVerificationEmail(body.email, token);
    await this.cacheManager.set(
      'verifyPassword',
      {
        token,
        email: body.email,
      },
      15 * 60 * 1000,
    );

    return {
      message: 'Please check your new password in Email',
      data: {
        expiresAt,
      },
    };
  }

  async changePassword(body: ChangePasswordDto) {
    const user = await this.findUserByEmail(body.email);

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    const storeVerify =
      await this.cacheManager.get<SecretOtp>('verifyPassword');

    if (!storeVerify?.token.includes(body.password) && !isPasswordValid) {
      throw new ConflictException(
        'The verification code does not exist or has expired.',
      );
    } else if (
      !storeVerify?.email.includes(body.email) &&
      !body.email.includes(user.email)
    ) {
      throw new ConflictException('Incorrect email');
    }

    await this.userRepository.update(
      {
        email: user.email,
      },
      {
        password: await hashPassword(body.newPassword),
      },
    );
    await this.cacheManager.del('verifyPassword');

    return {
      message: 'Password update successful',
    };
  }

  /** Helpers */
  private async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  private async findUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }
}
