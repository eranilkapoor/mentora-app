import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class EmailSignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
