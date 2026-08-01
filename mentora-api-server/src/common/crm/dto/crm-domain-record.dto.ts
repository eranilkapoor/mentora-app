import {
  IsArray,
  ArrayMinSize,
  IsDateString,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCrmDomainRecordDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn([
    'draft',
    'open',
    'in_progress',
    'approved',
    'rejected',
    'completed',
    'archived',
  ])
  status?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsMongoId()
  relatedLeadId?: string;

  @IsOptional()
  @IsMongoId()
  relatedApplicationId?: string;

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

export class UpdateCrmDomainRecordDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn([
    'draft',
    'open',
    'in_progress',
    'approved',
    'rejected',
    'completed',
    'archived',
  ])
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

export class CompleteCrmDomainRecordDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsObject()
  result?: Record<string, unknown>;
}

export class BulkUpdateCrmDomainRecordStatusDto {
  @IsMongoId()
  tenantId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  recordIds!: string[];

  @IsIn([
    'draft',
    'open',
    'in_progress',
    'approved',
    'rejected',
    'completed',
    'archived',
  ])
  status!: string;
}
