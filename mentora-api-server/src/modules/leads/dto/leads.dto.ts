import {
  IsArray,
  IsBoolean,
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

export const LEAD_TYPES = [
  'student_enquiry',
  'parent_enquiry',
  'organization_demo',
  'institution_admission',
  'course_enquiry',
  'exam_prep',
  'partner_referral',
  'walk_in',
  'support_to_sales',
  'other',
] as const;

export const LEAD_PERSONAS = [
  'student',
  'parent',
  'guardian',
  'organization_admin',
  'school',
  'college',
  'university',
  'coaching_institute',
  'partner',
  'agent',
  'other',
] as const;

export const LEAD_CAPTURE_CHANNELS = [
  'website',
  'landing_page',
  'google_ads',
  'meta_ads',
  'whatsapp',
  'call',
  'walk_in',
  'education_fair',
  'referral',
  'partner',
  'import',
  'api',
  'mobile_app',
  'public_website',
  'other',
] as const;

export const LEAD_STATUSES = [
  'new',
  'open',
  'won',
  'lost',
  'duplicate',
  'archived',
] as const;

export const LEAD_SOURCE_CATEGORIES = [
  'website',
  'paid_advertisement',
  'organic',
  'referral',
  'partner',
  'walk_in',
  'call_center',
  'education_fair',
  'import',
  'social_media',
  'api',
  'other',
] as const;

export const LEAD_STAGE_CATEGORIES = [
  'new',
  'contacted',
  'qualified',
  'application',
  'converted',
  'lost',
] as const;

export class LeadTaxonomyListDto {
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
  @IsIn(['active', 'inactive', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}

export class CreateLeadSourceDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsIn(LEAD_SOURCE_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsMongoId()
  parentSourceId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  defaultAssignmentRule?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  defaultCampaign?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsIn(['active', 'inactive', 'archived'])
  status?: string;
}

export class UpdateLeadSourceDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsIn(LEAD_SOURCE_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsMongoId()
  parentSourceId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  defaultAssignmentRule?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  defaultCampaign?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsIn(['active', 'inactive', 'archived'])
  status?: string;
}

export class CreateLeadStageDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsIn(LEAD_STAGE_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isConverted?: boolean;

  @IsOptional()
  @IsBoolean()
  isLost?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresRemarks?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mandatoryFieldsBeforeEntry?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  allowedNextStageIds?: string[];

  @IsOptional()
  @IsNumber()
  slaDurationHours?: number;

  @IsOptional()
  @IsObject()
  escalationRule?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['active', 'inactive', 'archived'])
  status?: string;
}

export class UpdateLeadStageDto extends CreateLeadStageDto {
  @IsOptional()
  @IsString()
  overrideReason?: string;
}

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
  @IsIn(LEAD_TYPES)
  leadType?: string;

  @IsOptional()
  @IsIn(LEAD_PERSONAS)
  persona?: string;

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
  preferredBranch?: string;

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
  @IsIn(LEAD_CAPTURE_CHANNELS)
  captureChannel?: string;

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
  @IsIn(LEAD_STATUSES)
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
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;

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
  @IsIn(LEAD_TYPES)
  leadType?: string;

  @IsOptional()
  @IsIn(LEAD_PERSONAS)
  persona?: string;

  @IsOptional()
  @IsIn(LEAD_CAPTURE_CHANNELS)
  captureChannel?: string;

  @IsOptional()
  @IsString()
  campaign?: string;

  @IsOptional()
  @IsString()
  interestedCourse?: string;

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

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

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
  @IsIn([
    'manual',
    'round_robin',
    'course_based',
    'branch_based',
    'location_based',
    'branch_preference_based',
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
  @IsIn(['active', 'reassigned', 'released'])
  status?: string;
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
  @IsIn(LEAD_TYPES)
  leadType?: string;

  @IsOptional()
  @IsIn(LEAD_PERSONAS)
  persona?: string;

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
  preferredBranch?: string;

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
  @IsIn(LEAD_CAPTURE_CHANNELS)
  captureChannel?: string;

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
  @IsIn(LEAD_STATUSES)
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
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;

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
    'branch_preference_based',
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
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

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
