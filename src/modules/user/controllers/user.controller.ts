import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import {
  CreateUserDto,
  userPaginationDto,
} from 'src/common/dtos/user/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.create(createUserDto);

    return {
      status: HttpStatus.CREATED,
      messate: 'Create Account Successfully',
      data: result,
    };
  }

  @Get()
  getAllUser(@Query() query: userPaginationDto) {
    return this.userService.getAllUser(query);
  }

  @Get(':id')
  getDetailUser(@Param('id') id: string) {
    return this.userService.getDetailUser(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UserService) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
