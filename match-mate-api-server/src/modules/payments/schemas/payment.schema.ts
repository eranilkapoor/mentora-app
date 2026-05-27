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

  @Prop({ type: Object })
  gatewayPayload?: Record<string, unknown>;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Object })
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  @Prop({ default: 0 })
  attemptCount!: number;
}

export type PaymentDocument = HydratedDocument<Payment>;

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
