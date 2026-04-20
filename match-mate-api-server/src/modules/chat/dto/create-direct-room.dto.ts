import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDirectRoomDto {
  @IsMongoId()
  targetUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  initialMessage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientMessageId?: string;
}
