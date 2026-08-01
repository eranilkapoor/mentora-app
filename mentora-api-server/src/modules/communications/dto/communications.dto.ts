import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCommunicationDto {
  @IsMongoId()
  organizationId!: string;

  @IsIn(['lead', 'application', 'student', 'payment', 'general'])
  entityType!: string;

  @IsMongoId()
  entityId!: string;

  @IsIn(['email', 'sms', 'whatsapp', 'push', 'call', 'in_app'])
  channel!: string;

  @IsOptional()
  @IsIn(['inbound', 'outbound'])
  direction?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class UpdateCommunicationDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn(['email', 'sms', 'whatsapp', 'push', 'call', 'in_app'])
  channel?: string;

  @IsOptional()
  @IsIn(['inbound', 'outbound'])
  direction?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn([
    'queued',
    'sent',
    'delivered',
    'read',
    'failed',
    'bounced',
    'archived',
  ])
  status?: string;
}
