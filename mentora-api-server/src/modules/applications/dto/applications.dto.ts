import {
  IsArray,
  ArrayMinSize,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateApplicationDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  leadId?: string;

  @IsString()
  courseOffering!: string;

  @IsOptional()
  @IsObject()
  applicantProfile?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  formResponses?: Record<string, unknown>;
}

export class UpdateApplicationReviewDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn([
    'draft',
    'submitted',
    'under_review',
    'document_verification',
    'interview',
    'offer_issued',
    'admission_confirmed',
    'rejected',
    'withdrawn',
  ])
  status?: string;

  @IsOptional()
  @IsArray()
  documentRequirements?: Record<string, unknown>[];

  @IsOptional()
  @IsObject()
  formResponses?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateApplicationDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  courseOffering?: string;

  @IsOptional()
  @IsIn([
    'draft',
    'submitted',
    'under_review',
    'document_verification',
    'interview',
    'offer_issued',
    'admission_confirmed',
    'rejected',
    'withdrawn',
  ])
  status?: string;

  @IsOptional()
  @IsObject()
  applicantProfile?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  formResponses?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}

export class ApproveApplicationDto {
  @IsMongoId()
  organizationId!: string;

  @IsIn(['approved', 'rejected', 'offer_issued'])
  decision!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  offer?: Record<string, unknown>;
}

export class BulkUpdateApplicationStatusDto {
  @IsMongoId()
  organizationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  recordIds!: string[];

  @IsIn([
    'draft',
    'submitted',
    'under_review',
    'document_verification',
    'interview',
    'offer_issued',
    'admission_confirmed',
    'rejected',
    'withdrawn',
  ])
  status!: string;
}
