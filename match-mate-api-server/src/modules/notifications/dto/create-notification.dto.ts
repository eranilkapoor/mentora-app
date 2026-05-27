import {
  IsArray,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
} from '../notification.constants';

export class CreateNotificationDto {
  @IsMongoId()
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateKey?: string;

  @ValidateIf((dto: CreateNotificationDto) => !dto.templateKey)
  @IsString()
  @MaxLength(120)
  title!: string;

  @ValidateIf((dto: CreateNotificationDto) => !dto.templateKey)
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: (typeof NOTIFICATION_TYPES)[number];

  @IsOptional()
  @IsIn(NOTIFICATION_CATEGORIES)
  category?: (typeof NOTIFICATION_CATEGORIES)[number];

  @IsOptional()
  @IsMongoId()
  actorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  actorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  actorImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceId?: string;

  @IsOptional()
  @IsIn(NOTIFICATION_PRIORITIES)
  priority?: (typeof NOTIFICATION_PRIORITIES)[number];

  @IsOptional()
  @IsArray()
  @IsIn(NOTIFICATION_CHANNELS, { each: true })
  channels?: Array<(typeof NOTIFICATION_CHANNELS)[number]>;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string | number | boolean | null>;

  @IsOptional()
  @IsObject()
  action?: {
    screen: string;
    params?: Record<string, unknown>;
  };

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
