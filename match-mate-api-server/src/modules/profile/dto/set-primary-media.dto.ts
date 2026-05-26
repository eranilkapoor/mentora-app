import { IsMongoId } from 'class-validator';

export class SetPrimaryMediaDto {
  @IsMongoId()
  mediaId!: string;
}
