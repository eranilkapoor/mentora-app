import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class ReactToMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Matches(/\S/, { message: 'emoji must not be empty' })
  emoji?: string;
}
