import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateLocalizationSettingsDto {
  @IsOptional() @IsString() appLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLanguages?: string[];

  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() timezone?: string;

  @IsOptional()
  @IsIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  dateFormat?: string;

  @IsOptional() @IsString() currency?: string;
}
