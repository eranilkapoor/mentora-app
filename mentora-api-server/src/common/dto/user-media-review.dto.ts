import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UserMediaReviewDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
