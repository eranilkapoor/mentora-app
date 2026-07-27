import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsBoolean,
  IsString,
  Max,
  Min,
} from 'class-validator';

const CRM_PARTIAL_MODULE_KEYS = [
  'authentication',
  'user_management',
  'organization_management',
  'lead_management',
  'application_management',
  'admission_management',
  'marketing_automation',
  'communication',
  'call_center',
  'whatsapp_crm',
  'email_crm',
  'sms',
  'mobile_crm',
  'calendar',
  'task_management',
  'document_management',
  'payment',
  'finance',
  'scholarship',
  'interview',
  'event_management',
  'field_force_automation',
  'reports',
  'dashboard',
  'analytics',
  'ai_features',
  'integrations',
  'security',
] as const;

const CRM_USER_ROLES = [
  'super_admin',
  'organization_admin',
  'branch_admin',
  'admission_manager',
  'admission_counselor',
  'marketing_executive',
  'sales_executive',
  'call_center',
  'finance',
  'field_agent',
  'student',
  'parent',
] as const;

export class CreateCrmTenantDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsIn([
    'university',
    'college',
    'school',
    'coaching',
    'edtech',
    'study_abroad',
    'training',
  ])
  type?: string;

  @IsOptional()
  @IsString()
  primaryDomain?: string;
}

export class CreateCrmLeadDto {
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

export class PublicCrmLeadCaptureDto {
  @IsString()
  tenantCode!: string;

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
  program?: string;

  @IsOptional()
  @IsObject()
  utm?: Record<string, unknown>;
}

export class CreateCrmBranchDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class CreateCrmLeadSourceDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsIn([
    'website',
    'landing_page',
    'facebook',
    'google',
    'whatsapp',
    'offline',
    'walk_in',
    'referral',
    'import',
    'partner',
    'api',
  ])
  category?: string;
}

export class CreateCrmLeadStageDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isConverted?: boolean;

  @IsOptional()
  @IsBoolean()
  isLost?: boolean;
}

export class AssignCrmLeadDto {
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

export class ChangeCrmLeadStageDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  stageId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddCrmLeadActivityDto {
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

export class CreateCrmApplicationDto {
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

export class CreateCrmTaskDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['lead', 'application', 'student', 'payment', 'campaign', 'general'])
  entityType!: string;

  @IsMongoId()
  entityId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  assignedTo!: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

export class CreateCrmCampaignDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsIn(['email', 'sms', 'whatsapp', 'push', 'ads', 'landing_page'])
  channel!: string;

  @IsOptional()
  @IsIn(['draft', 'scheduled', 'running', 'completed', 'paused'])
  status?: string;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;
}

export class CreateCrmCommunicationDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['lead', 'application', 'student', 'payment', 'general'])
  entityType!: string;

  @IsMongoId()
  entityId!: string;

  @IsIn(['email', 'sms', 'whatsapp', 'push', 'call', 'in_app'])
  channel!: string;

  @IsOptional()
  @IsIn(['inbound', 'outbound'])
  direction?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class CreateCrmModuleRecordDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(CRM_PARTIAL_MODULE_KEYS)
  moduleKey!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'open', 'in_progress', 'blocked', 'completed', 'archived'])
  status?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class UpdateCrmModuleRecordDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'open', 'in_progress', 'blocked', 'completed', 'archived'])
  status?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class UpsertCrmUserMembershipDto {
  @IsMongoId()
  userId!: string;

  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  branchIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];

  @IsIn(CRM_USER_ROLES)
  role!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

export class SelectCrmContextDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(CRM_USER_ROLES)
  role!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;
}
