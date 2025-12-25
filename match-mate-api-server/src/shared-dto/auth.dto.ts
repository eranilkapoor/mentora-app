import { 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  IsEnum, 
  IsString, 
  Length 
} from 'class-validator';

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

export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
}

export class SocialLoginDto {
  @IsEnum(SocialProvider)
  provider: SocialProvider;
  @IsNotEmpty() @IsString() accessToken: string;
}

export class PhoneSendOtpDto {
  @IsNotEmpty() @IsString() phone: string;
}

export class PhoneVerifyDto {
  @IsNotEmpty() @IsString() phone: string;
  @IsNotEmpty() @Length(4, 6) otp: string;
}
