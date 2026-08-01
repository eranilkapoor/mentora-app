import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

export class CreateWorkflowRuleDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsIn(EDUCATION_PLATFORM_MODULE_KEYS)
  moduleKey!: string;

  @IsString()
  trigger!: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  actions?: Record<string, unknown>[];

  @IsOptional()
  @IsIn(['draft', 'active', 'paused', 'archived'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsObject()
  retryPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  slaPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  testMode?: Record<string, unknown>;
}

export class UpdateWorkflowRuleDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(EDUCATION_PLATFORM_MODULE_KEYS)
  moduleKey?: string;

  @IsOptional()
  @IsString()
  trigger?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  actions?: Record<string, unknown>[];

  @IsOptional()
  @IsIn(['draft', 'active', 'paused', 'archived'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsObject()
  retryPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  slaPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  testMode?: Record<string, unknown>;
}

export class ExecuteWorkflowDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  trigger!: string;

  @IsIn(EDUCATION_PLATFORM_MODULE_KEYS)
  moduleKey!: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsObject()
  input?: Record<string, unknown>;
}

export class RetryWorkflowExecutionDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
