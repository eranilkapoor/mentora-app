import { IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';

export class AllocateAdmissionDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  cohortName?: string;

  @IsOptional()
  @IsObject()
  allocation?: Record<string, unknown>;
}

export class HandoffAdmissionDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  targetSystem!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
