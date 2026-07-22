import { IsBoolean, IsMongoId } from 'class-validator';

export class TypingEventDto {
  @IsMongoId()
  roomId!: string;

  @IsBoolean()
  isTyping!: boolean;
}
