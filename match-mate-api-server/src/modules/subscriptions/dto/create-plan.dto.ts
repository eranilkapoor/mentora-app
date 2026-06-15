import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BillingCycle, PlanTier, PlanType } from '@/common/enums';

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsEnum(PlanTier)
  tier!: PlanTier;

  @IsOptional()
  @IsEnum(PlanType)
  planType?: PlanType;

  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;

  @IsNumber()
  price!: number;

  @IsNumber()
  durationDays!: number;

  @IsOptional()
  @IsNumber()
  trialDays?: number;

  @IsOptional()
  @IsBoolean()
  autoRenewDefault?: boolean;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
