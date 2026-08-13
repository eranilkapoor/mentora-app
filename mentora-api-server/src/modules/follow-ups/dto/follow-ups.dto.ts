import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFollowUpDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn(['lead', 'application', 'student', 'payment', 'campaign', 'general'])
  entityType?: string;

  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  entityName?: string;

  @IsOptional()
  @IsIn(['call', 'email', 'sms', 'whatsapp', 'meeting', 'task', 'other'])
  followUpType?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

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
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsDateString()
  reminderAt?: string;

  @IsOptional()
  @IsIn(['email', 'sms', 'whatsapp', 'in_app', 'phone'])
  reminderChannel?: string;

  @IsOptional()
  @IsString()
  escalationRule?: string;

  @IsOptional()
  @IsString()
  completionNote?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['open', 'in_progress', 'completed', 'cancelled', 'archived'])
  status?: string;
}

export class UpdateFollowUpDto extends CreateFollowUpDto {}
