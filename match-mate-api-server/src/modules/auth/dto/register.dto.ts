import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from './password-policy';

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

  @IsOptional()
  @Matches(/^[a-zA-Z0-9]{6,10}$/, {
    message: 'Invalid referral code',
  })
  referralCode?: string;
}
