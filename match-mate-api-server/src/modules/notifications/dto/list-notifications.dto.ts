import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_TYPES,
} from '../notification.constants';

function toInt(value: unknown): unknown {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return value;
}

function toBoolean(value: unknown): unknown {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return value;
}

export class ListNotificationsDto {
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  unreadOnly?: boolean = false;

  @IsOptional()
  @IsIn(NOTIFICATION_CATEGORIES)
  category?: (typeof NOTIFICATION_CATEGORIES)[number];

  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: (typeof NOTIFICATION_TYPES)[number];
}
