import { IsEmail, IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { LEAD_CAPTURE_CHANNELS, LEAD_PERSONAS, LEAD_TYPES } from './leads.dto';

export class LeadCaptureDto {
  @IsString()
  organizationCode!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(LEAD_TYPES)
  leadType?: string;

  @IsOptional()
  @IsIn(LEAD_PERSONAS)
  persona?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  program?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  academicLevel?: string;

  @IsOptional()
  @IsString()
  preferredMode?: string;

  @IsOptional()
  @IsString()
  campaign?: string;

  @IsOptional()
  @IsString()
  landingPage?: string;

  @IsOptional()
  @IsString()
  formSource?: string;

  @IsOptional()
  @IsIn(LEAD_CAPTURE_CHANNELS)
  captureChannel?: string;

  @IsOptional()
  @IsString()
  consentStatus?: string;

  @IsOptional()
  @IsObject()
  utm?: Record<string, unknown>;
}
