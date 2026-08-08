import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillingCycle, PlanTier, PlanType } from '@/common/enums';
import { StoreProductType } from '../enums/store-product-type.enum';

class AndroidStoreProductDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  basePlanId?: string;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsEnum(StoreProductType)
  productType!: StoreProductType;
}

class IosStoreProductDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  subscriptionGroupId?: string;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsEnum(StoreProductType)
  productType!: StoreProductType;
}

class PlanStoreProductsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AndroidStoreProductDto)
  android?: AndroidStoreProductDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IosStoreProductDto)
  ios?: IosStoreProductDto;
}

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
  @IsBoolean()
  isCustom?: boolean;

  @IsOptional()
  @IsString()
  audience?: 'consumer' | 'organization';

  @IsOptional()
  @IsString({ each: true })
  enabledModules?: string[];

  @IsOptional()
  @IsNumber()
  userLimit?: number;

  @IsOptional()
  @IsNumber()
  branchLimit?: number;

  @IsOptional()
  @IsNumber()
  leadLimit?: number;

  @IsOptional()
  @IsNumber()
  storageLimitGb?: number;

  @IsOptional()
  @IsNumber()
  aiCreditLimit?: number;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => PlanStoreProductsDto)
  storeProducts?: PlanStoreProductsDto;
}
