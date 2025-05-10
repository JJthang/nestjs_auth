import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import {
  createUserDto as CreateUserDto,
  idParams,
  updateUserDto,
  userPaginationDto,
} from 'src/common/dtos/user/user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('')
  getAllUser(@Body() query: userPaginationDto) {
    return this.userService.getAllUser(query);
  }

  @Get(':id')
  getDetailUser(@Param() params: idParams) {
    return this.userService.getDetailUser(params.id);
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
