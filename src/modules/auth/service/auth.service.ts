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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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

  async validateJwtUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found 2');
    }
    const currentUser = { id: user.id, role: user.role };
    return currentUser;
  }
}
