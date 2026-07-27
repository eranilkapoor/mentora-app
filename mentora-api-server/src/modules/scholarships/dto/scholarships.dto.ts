import {
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class EvaluateScholarshipDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsObject()
  criteria?: Record<string, unknown>;
}

export class DecideScholarshipDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['approved', 'rejected'])
  decision!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  award?: Record<string, unknown>;
}
