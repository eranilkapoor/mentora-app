import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EDUCATION_PLATFORM_USER_ROLES } from '@/common/constants/education-platform.constants';

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  branchName!: string;

  @IsString()
  branchCode!: string;

  @IsOptional()
  @IsString()
  branchCity?: string;

  @IsOptional()
  @IsString()
  branchState?: string;

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

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

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

export class ListOrganizationsDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

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
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}

export class ListOrganizationUsersDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role?: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}

export class CreateBranchDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  businessUnitId?: string;

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

export class CreateBusinessUnitDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsIn([
    'admissions',
    'academics',
    'marketing',
    'sales',
    'finance',
    'operations',
    'support',
    'technology',
  ])
  category?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;
}

export class CreateLeadSourceDto {
  @IsMongoId()
  organizationId!: string;

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
  organizationId!: string;

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
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  businessUnitId?: string;

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
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  businessUnitId?: string;

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
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  businessUnitId?: string;

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

export class UpsertOrganizationBrandingDto {
  @IsMongoId()
  organizationId!: string;

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
  organizationId!: string;

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

export class UpsertOrganizationUserDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  userId!: string;

  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  businessUnitIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  campusIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  branchIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  departmentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  teamIds?: string[];

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

export class CreateOrganizationUserDto {
  @IsMongoId()
  organizationId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  businessUnitIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  campusIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  branchIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  departmentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  teamIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
