import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';
import { validateEmail } from 'src/utils';

export class forgotPasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email' })
  @Matches(validateEmail, {
    message: 'Email is not valid in the required format',
  })
  email: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Matches(validateEmail, {
    message: 'Email is not valid in the required format',
  })
  email: string;

  @IsString()
  password: string;

  // @IsString()
  // @Match('password', { message: 'Confirmation password does not match' })
  // passwordConfirm: string;

  @IsString()
  newPassword: string;
}
