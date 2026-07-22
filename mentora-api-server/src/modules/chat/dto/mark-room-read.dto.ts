import { IsMongoId, IsOptional } from 'class-validator';

export class MarkRoomReadDto {
  @IsOptional()
  @IsMongoId()
  upToMessageId?: string;
}
