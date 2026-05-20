import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChannelPreferenceDto {
  @IsOptional() @IsBoolean() inApp?: boolean;
  @IsOptional() @IsBoolean() push?: boolean;
  @IsOptional() @IsBoolean() email?: boolean;
  @IsOptional() @IsBoolean() sms?: boolean;
}

export class QuietHoursDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() @Matches(/^\d{2}:\d{2}$/) start?: string;
  @IsOptional() @IsString() @Matches(/^\d{2}:\d{2}$/) end?: string;
  @IsOptional() @IsString() timezone?: string;
}

export class UpdateNotificationSettingsDto {
  @IsOptional() @IsBoolean() inAppEnabled?: boolean;
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @IsOptional() @IsBoolean() marketingEnabled?: boolean;
  @IsOptional() @IsBoolean() doNotDisturb?: boolean;
  @IsOptional() @IsBoolean() soundEnabled?: boolean;
  @IsOptional() @IsBoolean() vibrationEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferenceDto)
  interestReceived?: ChannelPreferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferenceDto)
  interestAccepted?: ChannelPreferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferenceDto)
  profileView?: ChannelPreferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferenceDto)
  matchFound?: ChannelPreferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferenceDto)
  messageReceived?: ChannelPreferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferenceDto)
  marketing?: ChannelPreferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferenceDto)
  system?: ChannelPreferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}
