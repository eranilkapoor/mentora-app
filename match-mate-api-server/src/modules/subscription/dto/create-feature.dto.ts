import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FeatureKey } from '@/common/enums';

export class CreateFeatureDto {
  @IsEnum(FeatureKey)
  key!: FeatureKey;

  @IsOptional()
  @IsString()
  description?: string;
}
