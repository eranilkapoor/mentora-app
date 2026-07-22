import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

const DLQ_STATES = [
  'waiting',
  'active',
  'completed',
  'failed',
  'delayed',
  'paused',
] as const;

function toInt(value: unknown): unknown {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return value;
}

export class NotificationDlqReplayAllDto {
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @IsIn(DLQ_STATES)
  state?: (typeof DLQ_STATES)[number];

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(3650)
  olderThanDays?: number;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(0)
  @Max(60000)
  intervalMs?: number = 200;
}
