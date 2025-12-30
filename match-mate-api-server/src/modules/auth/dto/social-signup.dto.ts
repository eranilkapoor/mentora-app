import { IsEnum, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

export class SocialSignupDto {
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @IsNotEmpty()
  providerId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  profile_photo?: string;
}
