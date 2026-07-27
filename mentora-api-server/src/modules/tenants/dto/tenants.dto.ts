import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsIn([
    'university',
    'college',
    'school',
    'coaching',
    'edtech',
    'study_abroad',
    'training',
  ])
  type?: string;

  @IsOptional()
  @IsString()
  primaryDomain?: string;
}

export class CreateBranchDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class CreateLeadSourceDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsIn([
    'website',
    'landing_page',
    'facebook',
    'google',
    'whatsapp',
    'offline',
    'walk_in',
    'referral',
    'import',
    'partner',
    'api',
  ])
  category?: string;
}

export class CreateLeadStageDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isConverted?: boolean;

  @IsOptional()
  @IsBoolean()
  isLost?: boolean;
}
