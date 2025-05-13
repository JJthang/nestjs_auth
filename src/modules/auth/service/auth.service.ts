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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async register(formData: createUserDto) {
    try {
      const user = this.userRepository.create({
        ...formData,
        password: await this.hashPassword(formData.password),
      });
      const result = await this.userRepository.save(user);
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
    console.log('idasdasdasdadsasd : ', id);
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
}
