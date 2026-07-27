import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateLeadDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsMongoId()
  sourceId?: string;

  @IsOptional()
  @IsMongoId()
  stageId?: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestedPrograms?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  attachments?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  voiceNotes?: Record<string, unknown>[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsIn(['cold', 'warm', 'hot'])
  temperature?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @IsOptional()
  @IsObject()
  utm?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateLeadTagsDto {
  @IsMongoId()
  tenantId!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}

export class AddLeadAttachmentDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsIn(['document', 'image', 'audio', 'voice_note', 'other'])
  type?: string;
}

export class ScoreLeadDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsObject()
  signals?: Record<string, unknown>;
}

export class TransferLeadDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  assignedTo!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AssignLeadDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  assignedTo!: string;

  @IsOptional()
  @IsIn([
    'manual',
    'round_robin',
    'course_based',
    'branch_based',
    'location_based',
    'workflow',
  ])
  assignmentMethod?: string;
}

export class ChangeLeadStageDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  stageId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddLeadActivityDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn([
    'lead_created',
    'assignment_changed',
    'stage_changed',
    'note_added',
    'call_made',
    'email_sent',
    'sms_sent',
    'whatsapp_sent',
    'task_created',
    'application_started',
    'payment_received',
  ])
  type!: string;

  @IsOptional()
  @IsIn(['inbound', 'outbound', 'internal'])
  direction?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class FindLeadDuplicatesDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class MergeLeadsDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  sourceLeadId!: string;

  @IsOptional()
  @IsObject()
  fieldOverrides?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ImportLeadsDto {
  @IsMongoId()
  tenantId!: string;

  @IsArray()
  rows!: CreateLeadDto[];
}
