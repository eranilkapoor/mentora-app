import { IsMongoId, IsOptional, IsNumber } from 'class-validator';

export class AssignFeatureDto {
  @IsMongoId()
  planId!: string;

  @IsMongoId()
  featureId!: string;

  @IsOptional()
  @IsNumber()
  value!: number;
}
