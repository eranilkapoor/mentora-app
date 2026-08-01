import { IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';

export class AllocateAdmissionDto {
  @IsMongoId()
  organizationId!: string;

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
  organizationId!: string;

  @IsString()
  targetSystem!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
