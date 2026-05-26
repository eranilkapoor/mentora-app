import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuthProvider } from '../enums/auth-provider.enum';

export class SocialLoginDto {
  @IsEnum(AuthProvider)
  provider!: AuthProvider;

  @IsNotEmpty()
  provider_id!: string;

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
}
