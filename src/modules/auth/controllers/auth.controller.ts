import {
  Body,
  Controller,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { createUserDto } from 'src/common/dtos/user/user.dto';
import { AuthService } from '../service/auth.service';
import { LoginRequestDto } from 'src/common/dtos/auth/login.dto';
import { RefreshAuthGuard } from 'src/common/guards/auth/refreshToken.guard';
import { Request } from 'express';
import { sendEmailDto } from 'src/common/dtos/auth/emal.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // createUserDto
  @Post('/register')
  registerAccount(@Body() createAuthDto: createUserDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('/login')
  loginAccount(@Body() body: LoginRequestDto) {
    return this.authService.login(body);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('/refreshToken')
  refreshToken(@Req() req: { user: { id: number } }) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post('/confirmEmail')
  confirmEmail(
    @Body() body: sendEmailDto,
    @Session() session: Record<string, any>,
  ) {
    const token = Math.floor(100000 + Math.random() * 900000).toString(); // OTP 6 chữ số
    session.tokenConfirmEmail = token;
    session.email = body.email;
    return this.authService.sendUserConfirmation(body, token);
  }
}
