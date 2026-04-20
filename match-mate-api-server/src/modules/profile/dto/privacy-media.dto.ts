import { IsBoolean, IsIn, IsMongoId, IsOptional } from 'class-validator';

export class UpdatePrivacySettingsDto {
  @IsOptional()
  @IsIn(['public', 'private', 'contacts_only'])
  profileVisibility?: 'public' | 'private' | 'contacts_only';

  @IsOptional()
  @IsBoolean()
  hideContactDetails?: boolean;

  @IsOptional()
  @IsBoolean()
  hidePhotos?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnlyToPremium?: boolean;

  @IsOptional()
  @IsIn(['all', 'matches_only', 'contacts_only'])
  allowMessagesFrom?: 'all' | 'matches_only' | 'contacts_only';

  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;

  @IsOptional()
  @IsIn(['all', 'matches', 'none'])
  lastSeenVisibility?: 'all' | 'matches' | 'none';

  @IsOptional()
  @IsBoolean()
  incognitoMode?: boolean;
}

export class SetPrimaryMediaDto {
  @IsMongoId()
  mediaId!: string;
}
