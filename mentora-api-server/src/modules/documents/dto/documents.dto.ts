import {
  IsIn,
  IsArray,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDocumentDto {
  @IsMongoId()
  organizationId!: string;

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

export class VerifyDocumentDto {
  @IsMongoId()
  organizationId!: string;

  @IsIn(['verified', 'rejected', 'expired'])
  status!: string;

  @IsOptional()
  @IsObject()
  verification?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  ocrResult?: Record<string, unknown>;
}

export class UpdateDocumentDto {
  @IsMongoId()
  organizationId!: string;

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

export class BulkUpdateDocumentStatusDto {
  @IsMongoId()
  organizationId!: string;

  @IsArray()
  @IsMongoId({ each: true })
  ids!: string[];

  @IsIn([
    'required',
    'submitted',
    'verified',
    'rejected',
    'expired',
    'archived',
  ])
  status!: string;
}
