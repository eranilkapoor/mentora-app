import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateApplicationDto {
  @IsMongoId()
  tenantId!: string;

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
  tenantId!: string;

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

export class ApproveApplicationDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['approved', 'rejected', 'offer_issued'])
  decision!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  offer?: Record<string, unknown>;
}
