import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EDUCATION_PLATFORM_USER_ROLES } from '@/common/constants/education-platform.constants';
import { Status } from '@/common/enums';

export class ListAdminUsersDto {
  @IsOptional()
  @IsMongoId()
  organizationId?: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role?: string;

  @IsOptional()
  @IsIn([Status.ACTIVE, Status.PENDING, Status.SUSPENDED, Status.BLOCKED])
  status?: Status;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class CreateAdminUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role!: string;

  @IsMongoId()
  organizationId!: string;

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
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionOverrides?: string[];

  @IsOptional()
  @IsBoolean()
  mfaRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipRestrictions?: string[];
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn([Status.ACTIVE, Status.PENDING, Status.SUSPENDED, Status.BLOCKED])
  status?: Status;

  @IsOptional()
  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role?: string;

  @IsOptional()
  @IsMongoId()
  organizationId?: string;

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
  permissionOverrides?: string[];

  @IsOptional()
  @IsBoolean()
  mfaRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipRestrictions?: string[];
}
