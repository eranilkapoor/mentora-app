import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  // Enforce "module:action" format e.g. "profile:view", "admin:manage"
  @Matches(/^[a-z_]+:[a-z_]+$/, {
    message: 'Permission name must follow "module:action" format',
  })
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
