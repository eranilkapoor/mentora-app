import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  doNotDisturb?: boolean;

  @IsOptional()
  @IsObject()
  quietHours?: {
    enabled?: boolean;
    start?: string;
    end?: string;
    timezone?: string;
  };

  @IsOptional()
  @IsObject()
  preferences?: Record<
    string,
    { inApp?: boolean; push?: boolean; email?: boolean; sms?: boolean }
  >;

  @IsOptional()
  @IsString()
  dndStart?: string;

  @IsOptional()
  @IsString()
  dndEnd?: string;
}
