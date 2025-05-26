import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  idParams,
  updateUserDto,
  userPaginationDto,
} from '@/shared/dtos/user/user.dto';
import { JwtAuthGuard } from '@/shared/guards/auth/jwt.guard';
import { RefreshAuthGuard } from '@/shared/guards/auth/refreshToken.guard';
import { RolesGuard } from '@/shared/guards/auth/roles.guard';
import { Role } from '@/shared/enums/role.enum';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserService } from '../service/user.service';

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
