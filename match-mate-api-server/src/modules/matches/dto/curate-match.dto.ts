import { Type } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CurateMatchDto {
  @IsMongoId()
  userId!: string;

  @IsMongoId()
  profileUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  priority?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}
