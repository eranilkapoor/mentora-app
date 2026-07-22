import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Status } from '@/common/enums';

export class UpdateUserStatusDto {
  @IsMongoId()
  userId!: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
