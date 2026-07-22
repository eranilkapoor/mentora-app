import { Transform } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

function toInt(value: unknown): unknown {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return value;
}

export class ListMessagesDto {
  @IsOptional()
  @IsMongoId()
  beforeMessageId?: string;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30;
}
