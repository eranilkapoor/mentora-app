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
  organizationId!: string;

  @IsIn(EDUCATION_PLATFORM_USER_ROLES)
  role!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;
}
