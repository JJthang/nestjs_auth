import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsNotEmpty()
  password: string;
}
