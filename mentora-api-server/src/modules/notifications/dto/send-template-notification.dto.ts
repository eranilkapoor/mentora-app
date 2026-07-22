import {
  IsArray,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NOTIFICATION_CHANNELS } from '../notification.constants';

export class SendTemplateNotificationDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  templateKey!: string;

  @IsOptional()
  @IsArray()
  @IsIn(NOTIFICATION_CHANNELS, { each: true })
  channels?: Array<(typeof NOTIFICATION_CHANNELS)[number]>;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string | number | boolean | null>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsMongoId()
  actorId?: string;
}
