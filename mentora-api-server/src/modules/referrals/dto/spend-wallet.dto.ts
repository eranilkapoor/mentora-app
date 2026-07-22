import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SpendWalletDto {
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  coins!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
