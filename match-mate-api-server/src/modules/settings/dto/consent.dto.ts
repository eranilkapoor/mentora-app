import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ConsentType } from '../schemas/user-consent.schema';

export class RecordConsentDto {
  @IsEnum(ConsentType)
  type!: ConsentType;

  @IsString()
  @MaxLength(40)
  version!: string;

  @IsOptional()
  @IsBoolean()
  accepted?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;
}
