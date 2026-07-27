import {
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
}
