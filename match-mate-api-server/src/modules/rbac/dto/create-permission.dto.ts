import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
