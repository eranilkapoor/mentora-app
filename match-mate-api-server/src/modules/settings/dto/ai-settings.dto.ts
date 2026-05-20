import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAiSettingsDto {
  @IsOptional() @IsBoolean() aiRecommendationsEnabled?: boolean;
  @IsOptional() @IsBoolean() smartMatchRanking?: boolean;
  @IsOptional() @IsBoolean() horoscopeSuggestions?: boolean;
  @IsOptional() @IsBoolean() compatibilityScoring?: boolean;
  @IsOptional() @IsBoolean() allowAiBioGeneration?: boolean;
  @IsOptional() @IsBoolean() useProfileDataForRanking?: boolean;
}
