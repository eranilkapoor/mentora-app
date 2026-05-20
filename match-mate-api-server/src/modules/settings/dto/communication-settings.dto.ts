import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCommunicationSettingsDto {
  @IsOptional()
  @IsIn(['all', 'matches_only', 'contacts_only', 'no_one'])
  whoCanMessage?: string;

  @IsOptional()
  @IsIn(['all', 'matches_only', 'contacts_only', 'no_one'])
  whoCanCall?: string;

  @IsOptional() @IsBoolean() showReadReceipts?: boolean;
  @IsOptional() @IsBoolean() showTypingIndicator?: boolean;
  @IsOptional() @IsBoolean() autoReplyEnabled?: boolean;
  @IsOptional() @IsString() @MaxLength(200) autoReplyMessage?: string;
  @IsOptional() @IsBoolean() allowVoiceCalls?: boolean;
  @IsOptional() @IsBoolean() allowVideoCalls?: boolean;
}
