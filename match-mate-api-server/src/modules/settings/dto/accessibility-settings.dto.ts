import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateAccessibilitySettingsDto {
  @IsOptional()
  @IsEnum(['small', 'medium', 'large', 'extra_large'])
  fontSize?: string;

  @IsOptional() @IsBoolean() highContrastMode?: boolean;
  @IsOptional() @IsBoolean() reduceAnimations?: boolean;
  @IsOptional() @IsBoolean() screenReaderOptimized?: boolean;
  @IsOptional() @IsBoolean() boldText?: boolean;
}
