import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateOrganizationSecurityPolicyDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsBoolean()
  mfaRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  ssoRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIpCidrs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maskedFields?: string[];

  @IsOptional()
  @IsObject()
  sessionPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  dataRetentionPolicy?: Record<string, unknown>;
}
