import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import { SubscriptionStatus } from 'src/modules/subscription/enums/subscription-status.enum';

@Schema({ collection: COLLECTIONS.SUBSCRIPTION, timestamps: true })
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
  paymentId?: string;

  @Prop({
    enum: ['stripe', 'razorpay'],
  })
  paymentProvider?: string;

  @Prop({ default: false })
  autoRenew?: boolean;

  @Prop({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;
}

export type SubscriptionDocument = Subscription & Document;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ plan: 1 });