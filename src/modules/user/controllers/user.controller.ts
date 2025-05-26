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
import { JwtAuthGuard } from 'src/common/guards/auth/jwt.guard';
import { RefreshAuthGuard } from 'src/common/guards/auth/refreshToken.guard';
import { RolesGuard } from '@/common/guards/auth/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @UseGuards(RefreshAuthGuard)
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

  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param() params: idParams) {
    return this.userService.removeAccount(params.id);
  }
}
