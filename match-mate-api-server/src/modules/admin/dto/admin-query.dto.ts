import { IsOptional, IsString } from 'class-validator';

export class AdminQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
