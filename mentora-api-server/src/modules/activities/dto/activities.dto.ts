import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateActivityDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn([
    'lead',
    'application',
    'student',
    'organization',
    'payment',
    'campaign',
    'general',
  ])
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
  @IsIn([
    'note',
    'call',
    'email',
    'sms',
    'whatsapp',
    'meeting',
    'stage_change',
    'assignment',
    'system',
  ])
  activityType?: string;

  @IsOptional()
  @IsIn(['phone', 'email', 'sms', 'whatsapp', 'in_app', 'web', 'offline'])
  channel?: string;

  @IsOptional()
  @IsString()
  entityName?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  nextStep?: string;

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
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['open', 'in_progress', 'completed', 'archived'])
  status?: string;
}

export class UpdateActivityDto extends CreateActivityDto {}
