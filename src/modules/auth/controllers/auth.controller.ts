import { Body, Controller, Post } from '@nestjs/common';
import { createUserDto } from 'src/common/dtos/user/user.dto';
import { AuthService } from '../service/auth.service';
import { LoginRequestDto } from 'src/common/dtos/auth/login.dto';
import { UserService } from 'src/modules/user/service/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/register')
  registerAccount(@Body() createAuthDto: createUserDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('/login')
  loginAccount(@Body() body: LoginRequestDto) {
    return this.authService.login(body);
  }
}
