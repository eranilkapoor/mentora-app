import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { PaymentProvider, SubscriptionStatus } from '@/common/enums';

@Schema({ collection: COLLECTION_NAMES.SUBSCRIPTION, timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

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

  @Prop()
  trialEndsAt?: Date;

  @Prop()
  paymentId?: string;

  @Prop({ type: String, enum: PaymentProvider })
  paymentProvider?: PaymentProvider;

  @Prop({ default: false })
  autoRenew?: boolean;

  @Prop()
  storeProductId?: string;

  @Prop()
  storeTransactionId?: string;

  @Prop()
  storeOriginalTransactionId?: string;

  @Prop({ type: [Number], default: [] })
  reminderOffsetsSent?: number[];

  @Prop({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;
}

export type SubscriptionDocument = Subscription & Document;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
