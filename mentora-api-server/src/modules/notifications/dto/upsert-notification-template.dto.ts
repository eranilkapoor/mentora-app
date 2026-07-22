import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from '../notification.constants';

export class UpsertNotificationTemplateDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsIn(NOTIFICATION_CATEGORIES)
  category!: (typeof NOTIFICATION_CATEGORIES)[number];

  @IsOptional()
  @IsIn(NOTIFICATION_PRIORITIES)
  priority?: (typeof NOTIFICATION_PRIORITIES)[number];

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  pushTitle?: string;

  @IsOptional()
  @IsString()
  pushBody?: string;

  @IsOptional()
  @IsString()
  emailSubject?: string;

  @IsOptional()
  @IsString()
  emailBody?: string;

  @IsOptional()
  @IsString()
  smsBody?: string;

  @IsOptional()
  variables?: string[];

  @IsOptional()
  channels?: {
    inApp?: boolean;
    push?: boolean;
    email?: boolean;
    sms?: boolean;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
