import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class sendEmailDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email' })
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    { message: 'Email is not valid in the required format' },
  )
  email: string;

  @IsNotEmpty()
  name: string;
}
