import {
  IsArray,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EDUCATION_PLATFORM_USER_ROLES } from '@/common/constants/education-platform.constants';

export class UpsertUserMembershipDto {
  @IsMongoId()
  userId!: string;

  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  branchIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departmentIds?: string[];

  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role!: string;

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

export class SelectContextDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;
}
