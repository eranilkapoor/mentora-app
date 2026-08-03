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
  organizationId!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  middleName?: string;

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
  alternatePhone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  fullAddress?: string;

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
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  campus?: string;

  @IsOptional()
  @IsString()
  campaign?: string;

  @IsOptional()
  @IsString()
  subSource?: string;

  @IsOptional()
  @IsString()
  referral?: string;

  @IsOptional()
  @IsString()
  partner?: string;

  @IsOptional()
  @IsString()
  landingPage?: string;

  @IsOptional()
  @IsString()
  formSource?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestedPrograms?: string[];

  @IsOptional()
  @IsString()
  academicLevel?: string;

  @IsOptional()
  @IsString()
  interestedCourse?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  academicSession?: string;

  @IsOptional()
  @IsString()
  preferredMode?: string;

  @IsOptional()
  @IsString()
  intake?: string;

  @IsOptional()
  @IsString()
  assignmentMethod?: string;

  @IsOptional()
  @IsString()
  currentQualification?: string;

  @IsOptional()
  @IsString()
  percentageOrCgpa?: string;

  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  @IsOptional()
  @IsString()
  entranceExam?: string;

  @IsOptional()
  @IsString()
  examScore?: string;

  @IsOptional()
  @IsString()
  workExperience?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  preferredLocation?: string;

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
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsIn(['cold', 'warm', 'hot'])
  temperature?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @IsOptional()
  @IsString()
  followUpType?: string;

  @IsOptional()
  @IsString()
  followUpNote?: string;

  @IsOptional()
  @IsString()
  lostReason?: string;

  @IsOptional()
  @IsString()
  disqualificationReason?: string;

  @IsOptional()
  @IsString()
  consentStatus?: string;

  @IsOptional()
  @IsObject()
  utm?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class ListLeadsDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['new', 'open', 'won', 'lost', 'duplicate', 'archived'])
  status?: string;

  @IsOptional()
  @IsIn(['cold', 'warm', 'hot'])
  temperature?: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  sourceId?: string;

  @IsOptional()
  @IsMongoId()
  stageId?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}

export class ListLeadAssignmentsDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

export class UpdateLeadDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

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
  alternatePhone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  fullAddress?: string;

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
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  campus?: string;

  @IsOptional()
  @IsString()
  campaign?: string;

  @IsOptional()
  @IsString()
  subSource?: string;

  @IsOptional()
  @IsString()
  referral?: string;

  @IsOptional()
  @IsString()
  partner?: string;

  @IsOptional()
  @IsString()
  landingPage?: string;

  @IsOptional()
  @IsString()
  formSource?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestedPrograms?: string[];

  @IsOptional()
  @IsString()
  academicLevel?: string;

  @IsOptional()
  @IsString()
  interestedCourse?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  academicSession?: string;

  @IsOptional()
  @IsString()
  preferredMode?: string;

  @IsOptional()
  @IsString()
  intake?: string;

  @IsOptional()
  @IsString()
  assignmentMethod?: string;

  @IsOptional()
  @IsString()
  currentQualification?: string;

  @IsOptional()
  @IsString()
  percentageOrCgpa?: string;

  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  @IsOptional()
  @IsString()
  entranceExam?: string;

  @IsOptional()
  @IsString()
  examScore?: string;

  @IsOptional()
  @IsString()
  workExperience?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  preferredLocation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsIn(['cold', 'warm', 'hot'])
  temperature?: string;

  @IsOptional()
  @IsIn(['new', 'open', 'won', 'lost', 'duplicate', 'archived'])
  status?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @IsOptional()
  @IsString()
  followUpType?: string;

  @IsOptional()
  @IsString()
  followUpNote?: string;

  @IsOptional()
  @IsString()
  lostReason?: string;

  @IsOptional()
  @IsString()
  disqualificationReason?: string;

  @IsOptional()
  @IsString()
  consentStatus?: string;

  @IsOptional()
  @IsObject()
  utm?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateLeadTagsDto {
  @IsMongoId()
  organizationId!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}

export class AddLeadAttachmentDto {
  @IsMongoId()
  organizationId!: string;

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
  organizationId!: string;

  @IsOptional()
  @IsObject()
  signals?: Record<string, unknown>;
}

export class TransferLeadDto {
  @IsMongoId()
  organizationId!: string;

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
  organizationId!: string;

  @IsMongoId()
  assignedTo!: string;

  @IsOptional()
  @IsIn([
    'manual',
    'round_robin',
    'course_based',
    'branch_based',
    'location_based',
    'campus_based',
    'source_based',
    'campaign_based',
    'language_based',
    'capacity_based',
    'working_hours',
    'lead_score_based',
    'existing_relationship',
    'workflow',
  ])
  assignmentMethod?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;

  @IsOptional()
  @IsString()
  assignmentReason?: string;
}

export class ChangeLeadStageDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  stageId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddLeadActivityDto {
  @IsMongoId()
  organizationId!: string;

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
  organizationId!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class MergeLeadsDto {
  @IsMongoId()
  organizationId!: string;

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
  organizationId!: string;

  @IsArray()
  rows!: CreateLeadDto[];
}
