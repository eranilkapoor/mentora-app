import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserStatusDto {
  @IsMongoId()
  userId!: string;

  @IsBoolean()
  isBlocked!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
