import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
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

  @IsOptional()
  @IsDateString()
  reminderAt?: string;

  @IsOptional()
  @IsString()
  recurringRule?: string;
}

export class UpdateTaskWorkflowDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsIn(['open', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsIn(['todo', 'doing', 'blocked', 'done'])
  boardColumn?: string;

  @IsOptional()
  @IsIn(['healthy', 'at_risk', 'breached'])
  slaStatus?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsObject()
  escalation?: Record<string, unknown>;
}
