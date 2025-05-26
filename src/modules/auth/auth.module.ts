import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './service/auth.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/config/auth/jwt.config';
import refreshJwtConfig from 'src/config/auth/refreshJwt.config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from '@/shared/strategies/auth/jwt.straregy';
import { RefreshJwtStrategy } from '@/shared/strategies/auth/refresh.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from 'src/config/auth/mail.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/shared/guards/auth/jwt.guard';
import { RolesGuard } from '@/shared/guards/auth/roles.guard';
import { UserEntity } from '@/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register(jwtConfig()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    MailerModule.forRoot(mailerConfig),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
