import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAiSettingsDto {
  @IsOptional() @IsBoolean() aiRecommendationsEnabled?: boolean;
  @IsOptional() @IsBoolean() adaptiveTutorRanking?: boolean;
  @IsOptional() @IsBoolean() studyPlanSuggestions?: boolean;
  @IsOptional() @IsBoolean() progressScoring?: boolean;
  @IsOptional() @IsBoolean() allowAiProfileSummary?: boolean;
  @IsOptional() @IsBoolean() useProfileDataForPersonalization?: boolean;
}
