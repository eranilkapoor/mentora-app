import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from './password-policy';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  token!: string;

  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(64)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  newPassword!: string;

  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(64)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  confirmPassword!: string;
}

export class ResetPasswordCodeExchangeDto {
  @IsNotEmpty()
  code!: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword!: string;

  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(64)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  newPassword!: string;

  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(64)
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  confirmPassword!: string;
}
