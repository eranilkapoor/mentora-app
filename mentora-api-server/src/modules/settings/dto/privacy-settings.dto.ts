import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  ProfileVisibility,
  VisibilityLevel,
} from '../enums/settings-preferences.enums';

export class UpdatePrivacySettingsDto {
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @IsOptional() @IsBoolean() incognitoMode?: boolean;
  @IsOptional() @IsBoolean() showOnlyToPremium?: boolean;
  @IsOptional() @IsBoolean() showPhone?: boolean;
  @IsOptional() @IsBoolean() showEmail?: boolean;
  @IsOptional() @IsBoolean() showIncome?: boolean;
  @IsOptional() @IsBoolean() showExactAge?: boolean;

  @IsOptional()
  @IsEnum(VisibilityLevel)
  showPhotosTo?: VisibilityLevel;

  @IsOptional() @IsBoolean() blurPhotosForUnmatched?: boolean;
  @IsOptional() @IsBoolean() allowScreenshots?: boolean;
  @IsOptional() @IsBoolean() showOnlineStatus?: boolean;

  @IsOptional()
  @IsEnum(VisibilityLevel)
  showLastSeen?: VisibilityLevel;
}

export class BlockUserDto {
  @IsMongoId()
  targetUserId!: string;
}

export class HideProfileDto extends BlockUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason?: string;
}

export class ReportUserDto extends BlockUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
