import { IsString, IsNumber, IsEnum } from 'class-validator';
import { PlanTier } from 'src/common/enums';

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsEnum(PlanTier)
  tier!: PlanTier;

  @IsNumber()
  price!: number;

  @IsNumber()
  durationDays!: number;
}
