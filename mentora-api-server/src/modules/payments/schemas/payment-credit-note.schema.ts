import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

export type PaymentCreditNoteDocument = HydratedDocument<PaymentCreditNote>;

@Schema({
  collection: COLLECTION_NAMES.PAYMENT_CREDIT_NOTE,
  timestamps: true,
  versionKey: false,
})
export class PaymentCreditNote {
  @Prop({ required: true, unique: true, trim: true })
  creditNoteNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment', index: true })
  paymentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PaymentInvoice', index: true })
  invoiceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ default: 'INR', uppercase: true })
  currency!: string;

  @Prop({ enum: ['draft', 'issued', 'void'], default: 'issued', index: true })
  status!: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  reason!: string;

  @Prop({ default: Date.now })
  issuedAt!: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const PaymentCreditNoteSchema =
  SchemaFactory.createForClass(PaymentCreditNote);

PaymentCreditNoteSchema.index({ organizationId: 1, issuedAt: -1 });
PaymentCreditNoteSchema.index({ userId: 1, issuedAt: -1 });
