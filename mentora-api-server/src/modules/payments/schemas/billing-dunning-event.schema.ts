import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

export type BillingDunningEventDocument = HydratedDocument<BillingDunningEvent>;

@Schema({
  collection: COLLECTION_NAMES.BILLING_DUNNING_EVENT,
  timestamps: true,
  versionKey: false,
})
export class BillingDunningEvent {
  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', index: true })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment', index: true })
  paymentId?: Types.ObjectId;

  @Prop({
    enum: [
      'payment_failed',
      'renewal_due',
      'grace_started',
      'overdue',
      'suspended',
    ],
    required: true,
    index: true,
  })
  eventType!: string;

  @Prop({
    enum: ['open', 'notified', 'resolved', 'cancelled'],
    default: 'open',
  })
  status!: string;

  @Prop({ default: 1 })
  attempt!: number;

  @Prop()
  nextRetryAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const BillingDunningEventSchema =
  SchemaFactory.createForClass(BillingDunningEvent);

BillingDunningEventSchema.index({
  organizationId: 1,
  status: 1,
  nextRetryAt: 1,
});
BillingDunningEventSchema.index({ userId: 1, status: 1, nextRetryAt: 1 });
