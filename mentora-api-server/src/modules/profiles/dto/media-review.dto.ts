import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewMediaDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
