import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CommunicationAccess } from '../enums/settings-preferences.enums';

export class UpdateCommunicationSettingsDto {
  @IsOptional()
  @IsEnum(CommunicationAccess)
  whoCanMessage?: CommunicationAccess;

  @IsOptional()
  @IsEnum(CommunicationAccess)
  whoCanCall?: CommunicationAccess;

  @IsOptional() @IsBoolean() showReadReceipts?: boolean;
  @IsOptional() @IsBoolean() showTypingIndicator?: boolean;
  @IsOptional() @IsBoolean() autoReplyEnabled?: boolean;
  @IsOptional() @IsString() @MaxLength(200) autoReplyMessage?: string;
  @IsOptional() @IsBoolean() allowVoiceCalls?: boolean;
  @IsOptional() @IsBoolean() allowVideoCalls?: boolean;
}
