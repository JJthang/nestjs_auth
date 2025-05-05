import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import {
  createUserDto as CreateUserDto,
  idParams,
  updateUserDto,
} from 'src/common/dtos/user/user.dto';
import { LoginRequestDto } from 'src/common/dtos/auth/login.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.signUp(createUserDto);
    return {
      status: HttpStatus.CREATED,
      messate: 'Create Account Successfully',
      data: result,
    };
  }
  @Post('login')
  @Get()
  getAllUser(@Body() query: LoginRequestDto) {
    return this.userService.login(query);
  }

  @Get(':id')
  getDetailUser(@Param('id') id: idParams) {
    return this.userService.getDetailUser(+id);
  }

  @Patch(':id')
  update(@Param() params: idParams, @Body() updateUserDto: updateUserDto) {
    return this.userService.update(params.id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: idParams) {
    return this.userService.remove(+id);
  }
}
