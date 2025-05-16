import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsInt,
  Matches,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class createUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    { message: 'Email is not valid in the required format' },
  )
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

  @IsString()
  @IsOptional()
  keyConfirmEmail: string;
}

export class updateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
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

export class idParams {
  @Type(() => Number)
  @IsInt({ message: 'Id must be an integer' })
  id: number;
}
