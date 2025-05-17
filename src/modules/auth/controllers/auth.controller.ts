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
import { sendEmailDto } from 'src/common/dtos/auth/email.dto';
import {
  ChangePasswordDto,
  forgotPasswordDto,
} from 'src/common/dtos/auth/password.dto';

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
  confirmEmail(@Body() body: sendEmailDto) {
    return this.authService.sendUserConfirmation(body);
  }
  @Post('/verifyPassword')
  forgotPassword(@Body() body: forgotPasswordDto) {
    return this.authService.sendOtpVerifyPassword(body);
  }

  @Post('/changePassword')
  changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body);
  }
}
