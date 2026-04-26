import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsString,
  Length,
  Matches,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { AuthProvider } from '../enums/auth-provider.enum';

const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
const PASSWORD_POLICY_MESSAGE =
  'Password must include uppercase, lowercase, number, and special character';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  password!: string;

  @IsOptional()
  country_code?: string;

  @ValidateIf((dto: RegisterDto) => Boolean(dto.country_code))
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Invalid phone number',
  })
  phone?: string;
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

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  token!: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  newPassword!: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  confirmPassword!: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword!: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  newPassword!: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  confirmPassword!: string;
}
