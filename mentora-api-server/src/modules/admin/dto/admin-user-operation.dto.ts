import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role, Status } from '@/common/enums';
import { CreateProfileDto } from '@/modules/profiles/dto/create-profile.dto';
import { UpdatePreferenceDto } from '@/modules/profiles/dto/preference.dto';

export enum AdminProfileSection {
  PERSONAL = 'personal',
  PHYSICAL = 'physical',
  EDUCATION = 'education',
  FAMILY = 'family',
}

export enum AdminSettingsCategory {
  PRIVACY = 'privacy',
  NOTIFICATIONS = 'notifications',
  COMMUNICATION = 'communication',
  SECURITY = 'security',
  LOCALIZATION = 'localization',
  ACCESSIBILITY = 'accessibility',
  MEDIA = 'media',
  AI = 'ai',
}

export class AdminCreateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean;

  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminCreateUserProfileDto extends CreateProfileDto {}

export class AdminUpdateUserProfileSectionDto {
  @IsEnum(AdminProfileSection)
  section!: AdminProfileSection;

  @IsObject()
  data!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminUpdateUserPreferencesDto extends UpdatePreferenceDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminAssignUserPlanDto {
  @IsString()
  planId!: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminCancelUserPlanDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminUpdateUserSettingsDto {
  @IsEnum(AdminSettingsCategory)
  category!: AdminSettingsCategory;

  @IsObject()
  settings!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminCompleteUserSetupDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminCreateUserProfileDto)
  profile?: AdminCreateUserProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminUpdateUserPreferencesDto)
  preferences?: AdminUpdateUserPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminAssignUserPlanDto)
  subscription?: AdminAssignUserPlanDto;
}
