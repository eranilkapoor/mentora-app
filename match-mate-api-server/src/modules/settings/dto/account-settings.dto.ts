import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '@/modules/auth/dto/password-policy';

export class DeactivateAccountDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RequestEmailChangeDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_MESSAGE })
  password!: string;
}

export class RequestPhoneChangeDto {
  @IsString()
  countryCode!: string;

  @IsString()
  @Matches(/^\d{6,15}$/)
  phone!: string;
}
