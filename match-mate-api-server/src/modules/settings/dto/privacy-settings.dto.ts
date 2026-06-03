import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export type VisibilityLevel =
  | 'everyone'
  | 'accepted_matches'
  | 'contacts_only'
  | 'no_one';

export class UpdatePrivacySettingsDto {
  @IsOptional()
  @IsIn(['public', 'private', 'contacts_only', 'premium_only'])
  profileVisibility?: string;

  @IsOptional() @IsBoolean() incognitoMode?: boolean;
  @IsOptional() @IsBoolean() showOnlyToPremium?: boolean;
  @IsOptional() @IsBoolean() showPhone?: boolean;
  @IsOptional() @IsBoolean() showEmail?: boolean;
  @IsOptional() @IsBoolean() showIncome?: boolean;
  @IsOptional() @IsBoolean() showExactAge?: boolean;

  @IsOptional()
  @IsIn(['everyone', 'accepted_matches', 'contacts_only', 'no_one'])
  showPhotosTo?: VisibilityLevel;

  @IsOptional() @IsBoolean() blurPhotosForUnmatched?: boolean;
  @IsOptional() @IsBoolean() allowScreenshots?: boolean;
  @IsOptional() @IsBoolean() showOnlineStatus?: boolean;

  @IsOptional()
  @IsIn(['everyone', 'accepted_matches', 'contacts_only', 'no_one'])
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
