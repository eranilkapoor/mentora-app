import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { AuthProvider } from '../enums/auth-provider.enum';

export class SocialLoginDto {
  @IsEnum(AuthProvider)
  provider!: AuthProvider;

  @IsNotEmpty()
  @IsString()
  accessToken!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  profile_photo?: string;

  @IsOptional()
  @Matches(/^[a-zA-Z0-9]{6,10}$/, {
    message: 'Invalid referral code',
  })
  referralCode?: string;
}
