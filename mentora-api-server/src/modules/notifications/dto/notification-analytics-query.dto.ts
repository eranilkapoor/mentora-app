import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DELIVERY_LOG_CHANNELS } from '../notification.constants';

export class NotificationAnalyticsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30;

  @IsOptional()
  @IsIn(DELIVERY_LOG_CHANNELS)
  channel?: (typeof DELIVERY_LOG_CHANNELS)[number];

  @IsOptional()
  @IsString()
  templateKey?: string;
}
