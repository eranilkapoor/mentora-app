import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

export class CreateModuleRecordDto {
  @IsMongoId()
  organizationId!: string;

  @IsIn(EDUCATION_PLATFORM_MODULE_KEYS)
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

export class UpdateModuleRecordDto {
  @IsMongoId()
  organizationId!: string;

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

export class ExecuteModuleRecordDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsObject()
  result?: Record<string, unknown>;
}

export class BulkUpdateModuleRecordStatusDto {
  @IsMongoId()
  organizationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  recordIds!: string[];

  @IsIn(['draft', 'open', 'in_progress', 'blocked', 'completed', 'archived'])
  status!: string;
}
