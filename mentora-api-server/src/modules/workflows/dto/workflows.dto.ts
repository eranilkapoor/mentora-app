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
  tenantId!: string;

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
}

export class ExecuteWorkflowDto {
  @IsMongoId()
  tenantId!: string;

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
