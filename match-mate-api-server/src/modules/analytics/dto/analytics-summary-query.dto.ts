import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

function toInt(value: unknown): unknown {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) {
    return Number(value);
  }
  return value;
}

export class AnalyticsSummaryQueryDto {
  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(90)
  limit?: number;
}
