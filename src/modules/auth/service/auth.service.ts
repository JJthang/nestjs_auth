import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { User } from 'src/types/user.type';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { sendEmailDto } from 'src/common/dtos/auth/emal.dto';

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
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async register(formData: createUserDto) {
    const storedCode = await this.cacheManager.get<{
      token: string;
      email: string;
    }>('info');
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
        password: await this.hashPassword(formData.password),
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

  async login(formData: LoginRequestDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: formData.email,
      },
    });

    if (!user) {
      throw new ConflictException('Email is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      formData.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Password is incorrect now');
    }

    const { accessToken, refreshToken } = await this.generateToken(user.id);
    const hasTokenRefresh = await argon2.hash(refreshToken);

    await this.userRepository.update(
      {
        id: user.id,
      },
      {
        hasTokenRefresh,
      },
    );

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
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new ConflictException('Not found user');
    }

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
      throw new UnauthorizedException('Invalid Refresh Token');

    const refreshTokenMatches = await argon2.verify(
      user.hasTokenRefresh,
      refreshToken,
    );

    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');

    return { id: userId };
  }

  async sendUserConfirmation(user: sendEmailDto, token: string) {
    const userResult = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (userResult) {
      throw new ConflictException('Email already exists');
    }

    await this.cacheManager.set(
      'info',
      {
        token,
        email: user.email,
      },
      15 * 60 * 1000,
    );

    // 2. Sinh token
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      html: `
      <p>Hey ${user.email},</p>
      <p>Your code is <strong>${token}</strong>. It expires in 15 minutes.</p>
    `,
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        text: `Mã của bạn là ${token}. Hết hạn sau 15 phút.`,
      },
    });

    return { message: 'Confirmation email sent', expiresAt };
  }
}
