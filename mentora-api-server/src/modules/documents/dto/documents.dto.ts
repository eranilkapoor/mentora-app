import {
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCrmDocumentDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['lead', 'application', 'admission', 'student', 'scholarship'])
  entityType!: string;

  @IsMongoId()
  entityId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsIn(['identity', 'academic', 'payment', 'consent', 'other'])
  category?: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;
}

export class VerifyCrmDocumentDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['verified', 'rejected', 'expired'])
  status!: string;

  @IsOptional()
  @IsObject()
  verification?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  ocrResult?: Record<string, unknown>;
}

export class UpdateCrmDocumentDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['identity', 'academic', 'payment', 'consent', 'other'])
  category?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsIn([
    'required',
    'submitted',
    'verified',
    'rejected',
    'expired',
    'archived',
  ])
  status?: string;
}
