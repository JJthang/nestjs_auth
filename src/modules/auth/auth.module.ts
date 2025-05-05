import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/database';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './service/auth.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/config/auth/jwt.config';
import refreshJwtConfig from 'src/config/auth/refreshJwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register(jwtConfig()),
    // ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
