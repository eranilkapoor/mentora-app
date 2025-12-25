import { IsMongoId } from 'class-validator';

export class MarkReadDto {
  @IsMongoId()
  notificationId: string;
}