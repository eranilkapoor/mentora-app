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
