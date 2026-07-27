import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EDUCATION_PLATFORM_USER_ROLES } from '@/common/constants/education-platform.constants';

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

export class CreateDepartmentDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsIn(['admissions', 'sales', 'marketing', 'finance', 'academics', 'ops'])
  function?: string;
}

export class CreateTeamDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  managerId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  memberIds?: string[];

  @IsOptional()
  @IsObject()
  capacityRules?: Record<string, unknown>;
}

export class CreateCampusDto {
  @IsMongoId()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  holidays?: string[];
}

export class UpsertTenantBrandingDto {
  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domains?: string[];

  @IsOptional()
  @IsObject()
  theme?: Record<string, unknown>;
}

export class UpsertChannelSettingDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['whatsapp', 'sms', 'email', 'call_center', 'payment', 'calendar'])
  channel!: string;

  @IsOptional()
  @IsIn(['disabled', 'sandbox', 'active'])
  status?: string;

  @IsOptional()
  @IsObject()
  provider?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  limits?: Record<string, unknown>;
}

export class UpsertTenantUserDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  userId!: string;

  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  branchIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
