import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewChatMessageDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
