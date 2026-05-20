import { IsEnum, IsMongoId } from 'class-validator';

export class RespondInterestDto {
  @IsMongoId()
  interestId!: string;

  @IsEnum(['ACCEPT', 'REJECT'])
  action!: 'ACCEPT' | 'REJECT';
}
