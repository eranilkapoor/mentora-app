import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { AccessibilityFontSize } from '../enums/settings-preferences.enums';

export class UpdateAccessibilitySettingsDto {
  @IsOptional()
  @IsEnum(AccessibilityFontSize)
  fontSize?: AccessibilityFontSize;

  @IsOptional() @IsBoolean() highContrastMode?: boolean;
  @IsOptional() @IsBoolean() reduceAnimations?: boolean;
  @IsOptional() @IsBoolean() screenReaderOptimized?: boolean;
  @IsOptional() @IsBoolean() boldText?: boolean;
}
