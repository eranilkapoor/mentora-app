import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FeatureKey } from 'src/common/enums';

export class CreateFeatureDto {
  @IsEnum(FeatureKey)
  key!: FeatureKey;

  @IsOptional()
  @IsString()
  description?: string;
}
