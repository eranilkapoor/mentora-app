import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AnalyticsEventType } from '../enums/analytics-event.enum';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsEnum(AnalyticsEventType)
  eventType?: AnalyticsEventType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
