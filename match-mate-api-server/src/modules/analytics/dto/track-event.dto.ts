import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { AnalyticsEventType } from '../enums/analytics-event.enum';

export class TrackEventDto {
  @IsString()
  userId: string;

  @IsEnum(AnalyticsEventType)
  eventType: AnalyticsEventType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  platform?: 'web' | 'android' | 'ios';
}
