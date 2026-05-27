import { IsMongoId } from 'class-validator';

export class SendInterestDto {
  @IsMongoId()
  receiverId!: string;
}
