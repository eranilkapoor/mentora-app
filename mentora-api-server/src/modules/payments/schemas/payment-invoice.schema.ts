import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.PAYMENT_INVOICE, timestamps: true })
export class PaymentInvoice {
  @Prop({ required: true, unique: true })
  invoiceNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true, index: true })
  paymentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ required: true })
  orderId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Plan' })
  planId?: Types.ObjectId;

  @Prop({ default: 'INR', uppercase: true })
  currency!: string;

  @Prop({ required: true, min: 0 })
  taxableAmount!: number;

  @Prop({ default: 0, min: 0 })
  discountAmount!: number;

  @Prop({ default: 0, min: 0 })
  gstPercentage!: number;

  @Prop({ default: 0, min: 0 })
  gstAmount!: number;

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({ default: '998439' })
  sacCode!: string;

  @Prop()
  customerGstin?: string;

  @Prop({ type: Object })
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  @Prop({ default: Date.now })
  issuedAt!: Date;

  @Prop({ trim: true, index: true })
  source?: string;

  @Prop({ trim: true, maxlength: 250 })
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ trim: true })
  pdfStorageKey?: string;

  @Prop({ trim: true })
  pdfUrl?: string;

  @Prop({ trim: true })
  pdfChecksum?: string;

  @Prop()
  pdfGeneratedAt?: Date;

  @Prop({ default: true })
  immutable!: boolean;

  @Prop()
  dueAt?: Date;

  @Prop()
  paidAt?: Date;

  @Prop({
    enum: ['draft', 'issued', 'paid', 'void', 'overdue'],
    default: 'issued',
  })
  status!: string;

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
}

export type PaymentInvoiceDocument = PaymentInvoice & Document;
export const PaymentInvoiceSchema =
  SchemaFactory.createForClass(PaymentInvoice);

PaymentInvoiceSchema.index({ userId: 1, issuedAt: -1 });
PaymentInvoiceSchema.index({ organizationId: 1, issuedAt: -1 });
PaymentInvoiceSchema.index({ issuedAt: -1 });
PaymentInvoiceSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
PaymentInvoiceSchema.index({ anonymizedAt: 1, retentionReason: 1 });
PaymentInvoiceSchema.index({ legalHoldUntil: 1 });
