import {
  IsArray,
  IsDateString,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCampaignDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

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
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateCampaignMetricsDto {
  @IsMongoId()
  tenantId!: string;

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
