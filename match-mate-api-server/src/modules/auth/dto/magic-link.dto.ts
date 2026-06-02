import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class MagicLinkRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class MagicLinkVerifyDto {
  @IsNotEmpty()
  @IsString()
  token!: string;
}
