import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PaymentStatus } from '../enums/payment-status.enum';
import { COLLECTION_NAMES } from '@/common/constants';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';

@Schema({
  collection: COLLECTION_NAMES.PAYMENT,
  timestamps: true,
  versionKey: false,
})
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  orderId!: string;

  @Prop({ index: true, sparse: true })
  gatewayOrderId?: string;

  @Prop({ index: true, sparse: true })
  gatewayPaymentId?: string;

  @Prop({ index: true, unique: true, sparse: true })
  idempotencyKey?: string;

  @Prop({ type: Types.ObjectId, ref: 'Plan', index: true })
  planId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', index: true })
  subscriptionId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ default: 0, min: 0 })
  taxAmount!: number;

  @Prop({ default: 0, min: 0 })
  discountAmount!: number;

  @Prop({ uppercase: true, trim: true, index: true, sparse: true })
  couponCode?: string;

  @Prop({ type: Types.ObjectId, ref: 'PaymentInvoice', index: true })
  invoiceId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  netAmount!: number;

  @Prop({ default: 'INR', uppercase: true, minlength: 3, maxlength: 3 })
  currency!: string;

  @Prop({ enum: PaymentGateway, default: PaymentGateway.RAZORPAY, index: true })
  gateway!: PaymentGateway;

  @Prop({ enum: PaymentMethod })
  method?: PaymentMethod;

  @Prop({
    enum: PaymentPurpose,
    default: PaymentPurpose.SUBSCRIPTION,
    index: true,
  })
  purpose!: PaymentPurpose;

  @Prop({
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    index: true,
  })
  status!: PaymentStatus;

  @Prop({ required: true })
  initiatedAt!: Date;

  @Prop()
  paidAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  refundedAt?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop()
  failureCode?: string;

  @Prop()
  failureReason?: string;

  @Prop({ default: false })
  signatureVerified!: boolean;

  @Prop({ default: false })
  webhookVerified!: boolean;

  @Prop({ trim: true })
  settlementId?: string;

  @Prop()
  settledAt?: Date;

  @Prop({ default: 0, min: 0 })
  refundedAmount!: number;

  @Prop({ default: 0, min: 0 })
  prorationAmount!: number;

  @Prop({ type: Object })
  gatewayPayload?: Record<string, unknown>;

  @Prop({ index: true, sparse: true })
  storeProductId?: string;

  @Prop({ index: true, sparse: true })
  storeBasePlanId?: string;

  @Prop({ sparse: true })
  storeOfferId?: string;

  @Prop({ index: true, sparse: true })
  storeTransactionId?: string;

  @Prop({ index: true, sparse: true })
  storeOriginalTransactionId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ trim: true, index: true })
  source?: string;

  @Prop({ trim: true, maxlength: 250 })
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  version!: number;

  @Prop({ index: true })
  deletedAt?: Date;

  @Prop({ index: true })
  anonymizedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  retentionReason?: string;

  @Prop()
  legalHoldUntil?: Date;

  @Prop({ type: Object })
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    gstin?: string;
  };

  @Prop({ default: 0 })
  attemptCount!: number;
}

export type PaymentDocument = HydratedDocument<Payment>;

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ organizationId: 1, createdAt: -1 });
PaymentSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ gateway: 1, settlementId: 1 }, { sparse: true });
PaymentSchema.index({ anonymizedAt: 1, retentionReason: 1 });
PaymentSchema.index({ legalHoldUntil: 1 });
PaymentSchema.index(
  { gateway: 1, storeTransactionId: 1 },
  {
    unique: true,
    sparse: true,
  },
);
PaymentSchema.index({ gateway: 1, storeOriginalTransactionId: 1, paidAt: -1 });
