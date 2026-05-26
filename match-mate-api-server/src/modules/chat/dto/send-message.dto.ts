import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessageType } from '../enums/chat.enums';

export class MessageAttachmentDto {
  @IsString()
  @MaxLength(500)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  size?: number;
}

export class SendMessageBodyDto {
  @IsString()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsEnum(ChatMessageType)
  type?: ChatMessageType;

  @IsOptional()
  @IsMongoId()
  replyToMessageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientMessageId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments?: MessageAttachmentDto[];
}

export class SendMessageDto extends SendMessageBodyDto {
  @IsMongoId()
  roomId!: string;
}
