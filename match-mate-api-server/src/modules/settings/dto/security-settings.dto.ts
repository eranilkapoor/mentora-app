import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TwoFactorMethod } from '../enums/settings-preferences.enums';

export class UpdateSecuritySettingsDto {
  @IsOptional() @IsBoolean() twoFactorEnabled?: boolean;

  @IsOptional()
  @IsEnum(TwoFactorMethod)
  twoFactorMethod?: TwoFactorMethod;

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
