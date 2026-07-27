import { IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsMongoId()
  leadId?: string;

  @IsString()
  courseOffering!: string;

  @IsOptional()
  @IsObject()
  applicantProfile?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  formResponses?: Record<string, unknown>;
}
