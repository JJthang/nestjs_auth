import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  hasTokenRefresh?: string;
}

export class userPaginationDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 5;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  setOff?: number = 0;

  @IsString()
  @Type(() => String)
  @IsOptional()
  email?: string;
}
