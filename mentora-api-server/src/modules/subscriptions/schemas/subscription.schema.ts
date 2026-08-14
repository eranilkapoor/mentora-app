import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { PaymentProvider, SubscriptionStatus } from '@/common/enums';

@Schema({ collection: COLLECTION_NAMES.SUBSCRIPTION, timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId!: Types.ObjectId;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancelledReason?: string;

  @Prop({ trim: true, index: true })
  source?: string;

  @Prop({ trim: true, maxlength: 250 })
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  version!: number;

  @Prop()
  trialEndsAt?: Date;

  @Prop({ default: 0, min: 0 })
  seatCount!: number;

  @Prop({ type: Object, default: {} })
  usageSnapshot!: Record<string, unknown>;

  @Prop()
  nextBillingAt?: Date;

  @Prop({ trim: true })
  prorationPolicy?: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment', index: true })
  paymentId?: Types.ObjectId;

  @Prop({ type: String, enum: PaymentProvider })
  paymentProvider?: PaymentProvider;

  @Prop({ default: false })
  autoRenew?: boolean;

  @Prop()
  storeProductId?: string;

  @Prop()
  storeBasePlanId?: string;

  @Prop()
  storeOfferId?: string;

  @Prop({ index: true, sparse: true, unique: true })
  storePurchaseToken?: string;

  @Prop()
  storeTransactionId?: string;

  @Prop()
  storeOriginalTransactionId?: string;

  @Prop()
  storeEnvironment?: string;

  @Prop()
  storeLastVerifiedAt?: Date;

  @Prop({ type: [Number], default: [] })
  reminderOffsetsSent?: number[];

  @Prop({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Prop({ index: true })
  deletedAt?: Date;

  @Prop({ index: true })
  anonymizedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  retentionReason?: string;

  @Prop()
  legalHoldUntil?: Date;
}

export type SubscriptionDocument = Subscription & Document;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ userId: 1, createdAt: -1 });
SubscriptionSchema.index({ organizationId: 1, status: 1, endDate: -1 });
SubscriptionSchema.index({ status: 1, endDate: -1 });
SubscriptionSchema.index({ organizationId: 1, nextBillingAt: 1, status: 1 });
SubscriptionSchema.index({ anonymizedAt: 1, retentionReason: 1 });
SubscriptionSchema.index({ legalHoldUntil: 1 });
