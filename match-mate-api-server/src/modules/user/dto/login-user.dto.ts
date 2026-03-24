import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  email?: string;

  @IsString()
  phone?: string;

  @IsString()
  password: string;
}
