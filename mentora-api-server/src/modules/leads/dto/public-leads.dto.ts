import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';

export class PublicLeadCaptureDto {
  @IsString()
  tenantCode!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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
  @IsObject()
  utm?: Record<string, unknown>;
}
