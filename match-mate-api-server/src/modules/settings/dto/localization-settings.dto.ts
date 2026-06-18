import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { DateFormat } from '../enums/settings-preferences.enums';

export class UpdateLocalizationSettingsDto {
  @IsOptional() @IsString() appLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLanguages?: string[];

  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsBoolean() shareLocation?: boolean;

  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat;

  @IsOptional() @IsString() currency?: string;
}
