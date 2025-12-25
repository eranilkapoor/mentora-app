import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class LoginUserDto {
  @ValidateIf(o => !o.phone)
  @IsString()
  email?: string;

  @ValidateIf(o => !o.email)
  @IsString()
  phone?: string;

  @IsString()
  password: string;
}