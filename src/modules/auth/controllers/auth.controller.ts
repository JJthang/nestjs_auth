import { Body, Controller, Post } from '@nestjs/common';
import { createUserDto } from 'src/common/dtos/user/user.dto';
import { AuthService } from '../service/auth.service';
import { LoginRequestDto } from 'src/common/dtos/auth/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService) {}

  @Post('/register')
  registerAccount(@Body() createAuthDto: createUserDto) {
    console.log('====================================');
    console.log('WOW Good job');
    console.log('====================================');
    return this.userService.register(createAuthDto);
  }

  @Post('/login')
  loginAccount(@Body() body: LoginRequestDto) {
    return this.userService.login(body);
  }
}
