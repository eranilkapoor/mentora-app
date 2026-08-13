import {
  IsArray,
  IsDateString,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['email', 'sms', 'whatsapp', 'push', 'ads', 'landing_page'])
  channel!: string;

  @IsOptional()
  @IsIn(['draft', 'scheduled', 'running', 'completed', 'paused'])
  status?: string;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  audience?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  utm?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  variants?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  dripSteps?: Record<string, unknown>[];

  @IsOptional()
  @IsObject()
  roi?: Record<string, unknown>;

  @IsOptional()
  @IsMongoId()
  sourceId?: string;

  @IsOptional()
  @IsMongoId()
  leadStageId?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  spend?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  landingPageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conversionTags?: string[];

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerCampaignId?: string;

  @IsOptional()
  @IsIn(['draft', 'pending_approval', 'approved', 'rejected'])
  approvalStatus?: string;

  @IsOptional()
  @IsMongoId()
  approvedBy?: string;

  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateCampaignMetricsDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn(['draft', 'scheduled', 'running', 'completed', 'paused'])
  status?: string;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  roi?: Record<string, unknown>;
}

export class UpdateCampaignDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['email', 'sms', 'whatsapp', 'push', 'ads', 'landing_page'])
  channel?: string;

  @IsOptional()
  @IsIn(['draft', 'scheduled', 'running', 'completed', 'paused', 'archived'])
  status?: string;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  audience?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  utm?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  variants?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  dripSteps?: Record<string, unknown>[];

  @IsOptional()
  @IsObject()
  roi?: Record<string, unknown>;

  @IsOptional()
  @IsMongoId()
  sourceId?: string;

  @IsOptional()
  @IsMongoId()
  leadStageId?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  spend?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  landingPageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conversionTags?: string[];

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerCampaignId?: string;

  @IsOptional()
  @IsIn(['draft', 'pending_approval', 'approved', 'rejected'])
  approvalStatus?: string;

  @IsOptional()
  @IsMongoId()
  approvedBy?: string;

  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
