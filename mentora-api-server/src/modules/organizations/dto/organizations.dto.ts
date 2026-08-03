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

  @IsOptional()
  @IsString()
  legalName?: string;

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

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  financialYear?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsObject()
  subscription?: Record<string, unknown>;

  @IsOptional()
  @IsIn([
    'active',
    'trial',
    'suspended',
    'payment_overdue',
    'cancelled',
    'inactive',
  ])
  status?: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  legalName?: string;

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

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  financialYear?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsObject()
  subscription?: Record<string, unknown>;

  @IsOptional()
  @IsIn([
    'active',
    'trial',
    'suspended',
    'payment_overdue',
    'cancelled',
    'inactive',
  ])
  status?: string;
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
  @IsIn([
    'active',
    'trial',
    'suspended',
    'payment_overdue',
    'cancelled',
    'inactive',
  ])
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

export class ListOrganizationStructureDto {
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
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
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
    'paid_advertisement',
    'organic',
    'referral',
    'partner',
    'walk_in',
    'call_center',
    'education_fair',
    'import',
    'social_media',
    'api',
    'other',
  ])
  category?: string;

  @IsOptional()
  @IsMongoId()
  parentSourceId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  defaultAssignmentRule?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  defaultCampaign?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
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
  @IsString()
  color?: string;

  @IsOptional()
  @IsIn(['new', 'contacted', 'qualified', 'application', 'converted', 'lost'])
  category?: string;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isConverted?: boolean;

  @IsOptional()
  @IsBoolean()
  isLost?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresRemarks?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mandatoryFieldsBeforeEntry?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  allowedNextStageIds?: string[];

  @IsOptional()
  @IsNumber()
  slaDurationHours?: number;

  @IsOptional()
  @IsObject()
  escalationRule?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class CreateDepartmentDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsIn([
    'admissions',
    'sales',
    'marketing',
    'finance',
    'academics',
    'operations',
  ])
  function?: string;
}

export class CreateTeamDto {
  @IsMongoId()
  organizationId!: string;

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
