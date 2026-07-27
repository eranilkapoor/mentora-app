import {
  IsArray,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EDUCATION_PLATFORM_MODULE_KEYS } from '@/common/constants/education-platform.constants';

export class CreateReportDefinitionDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsIn(EDUCATION_PLATFORM_MODULE_KEYS)
  moduleKey!: string;

  @IsOptional()
  @IsIn(['table', 'funnel', 'summary', 'trend'])
  reportType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  schedule?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['draft', 'active', 'archived'])
  status?: string;
}

export class CreateReportExportJobDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  reportDefinitionId!: string;

  @IsOptional()
  @IsIn(['csv', 'xlsx', 'pdf'])
  format?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;
}
