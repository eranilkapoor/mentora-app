import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class StartFreeTrialDto {
  @IsMongoId()
  planId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  trialDays?: number;
}
