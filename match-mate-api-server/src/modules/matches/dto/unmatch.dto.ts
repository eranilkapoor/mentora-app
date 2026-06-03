import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UnmatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason?: string;
}
