import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @MinLength(6) password: string;
  @IsOptional() phone?: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsNotEmpty() password: string;
}