import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsString,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';
import { AuthProvider } from '../enums/auth-provider.enum';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}

export class SocialLoginDto {
  @IsEnum(AuthProvider)
  provider!: AuthProvider;

  @IsNotEmpty()
  provider_id!: string;

  @IsNotEmpty()
  @IsString()
  access_token!: string;

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

export class PhoneSendOtpDto {
  @IsNotEmpty()
  country_code!: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Invalid phone number',
  })
  phone!: string;
}

export class PhoneVerifyDto {
  @IsNotEmpty()
  country_code!: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Invalid phone number',
  })
  phone!: string;

  @IsNotEmpty()
  @Length(6)
  otp!: string;
}
