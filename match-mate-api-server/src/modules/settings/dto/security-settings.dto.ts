import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateSecuritySettingsDto {
  @IsOptional() @IsBoolean() twoFactorEnabled?: boolean;

  @IsOptional()
  @IsEnum(['none', 'sms', 'email', 'authenticator'])
  twoFactorMethod?: string;

  @IsOptional() @IsBoolean() biometricEnabled?: boolean;
  @IsOptional() @IsBoolean() appPinEnabled?: boolean;
  @IsOptional() @IsBoolean() suspiciousLoginAlerts?: boolean;
  @IsOptional() @IsBoolean() loginNotifications?: boolean;
}

export class SetAppPinDto {
  @IsString()
  @Length(4, 6)
  pin!: string;
}

export class RevokeDeviceDto {
  @IsString()
  deviceId!: string;
}
