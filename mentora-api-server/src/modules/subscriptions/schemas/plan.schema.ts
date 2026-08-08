import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { BillingCycle, PlanTier, PlanType } from '@/common/enums';
import { StoreProductType } from '../enums/store-product-type.enum';

export class AndroidStoreProduct {
  productId!: string;
  basePlanId?: string;
  offerId?: string;
  productType!: StoreProductType;
}

export class IosStoreProduct {
  productId!: string;
  subscriptionGroupId?: string;
  offerId?: string;
  productType!: StoreProductType;
}

export class PlanStoreProducts {
  android?: AndroidStoreProduct;
  ios?: IosStoreProduct;
}

@Schema({ collection: COLLECTION_NAMES.PLAN, timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  name!: string; // GOLD_MONTHLY

  @Prop({ required: true, unique: true })
  slug!: string; // gold_monthly

  @Prop({ enum: PlanTier, required: true })
  tier!: PlanTier;

  @Prop({ type: String, enum: PlanType, default: PlanType.SELF_SERVICE })
  planType!: PlanType;

  @Prop({ type: String, enum: BillingCycle, required: true })
  billingCycle!: BillingCycle;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  durationDays!: number;

  @Prop({ default: 0, min: 0 })
  trialDays!: number;

  @Prop({ default: false })
  autoRenewDefault!: boolean;

  @Prop({ default: false })
  isCustom!: boolean;

  @Prop({ default: 'consumer', enum: ['consumer', 'organization'] })
  audience!: 'consumer' | 'organization';

  @Prop({ type: [String], default: [] })
  enabledModules!: string[];

  @Prop({ default: 1, min: 0 })
  userLimit!: number;

  @Prop({ default: 1, min: 0 })
  branchLimit!: number;

  @Prop({ default: 0, min: 0 })
  leadLimit!: number;

  @Prop({ default: 0, min: 0 })
  storageLimitGb!: number;

  @Prop({ default: 0, min: 0 })
  aiCreditLimit!: number;

  @Prop({ default: 'INR' })
  currency!: string;

  @Prop({ default: false })
  isPopular!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 1 })
  version!: number;

  @Prop({
    type: {
      android: {
        productId: String,
        basePlanId: String,
        offerId: String,
        productType: { type: String, enum: StoreProductType },
      },
      ios: {
        productId: String,
        subscriptionGroupId: String,
        offerId: String,
        productType: { type: String, enum: StoreProductType },
      },
    },
    _id: false,
  })
  storeProducts?: PlanStoreProducts;
}

export type PlanDocument = Plan & Document;
export const PlanSchema = SchemaFactory.createForClass(Plan);

PlanSchema.index({ tier: 1 });
PlanSchema.index({ planType: 1, sortOrder: 1 });
PlanSchema.index({ audience: 1, isActive: 1, sortOrder: 1 });
PlanSchema.index({ price: 1 });
PlanSchema.index({ isActive: 1 });
PlanSchema.index({ sortOrder: 1 });
PlanSchema.index({ 'storeProducts.android.productId': 1 });
PlanSchema.index({ 'storeProducts.ios.productId': 1 });
