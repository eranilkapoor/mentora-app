import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

export type BillingContractDocument = HydratedDocument<BillingContract>;

@Schema({
  collection: COLLECTION_NAMES.BILLING_CONTRACT,
  timestamps: true,
  versionKey: false,
})
export class BillingContract {
  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true, index: true })
  planId!: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  contractNumber!: string;

  @Prop({ enum: ['draft', 'active', 'expired', 'cancelled'], default: 'draft' })
  status!: string;

  @Prop({ trim: true })
  purchaseOrderNumber?: string;

  @Prop({ trim: true })
  legalEntityName?: string;

  @Prop({ trim: true })
  billingEmail?: string;

  @Prop({ trim: true })
  billingPhone?: string;

  @Prop({ trim: true })
  paymentTerms?: string;

  @Prop({ trim: true })
  renewalPolicy?: string;

  @Prop({ trim: true })
  taxNumber?: string;

  @Prop({ default: 'INR', uppercase: true })
  currency!: string;

  @Prop({ required: true, min: 0 })
  contractValue!: number;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ type: Object, default: {} })
  terms!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  limits!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  approvals!: Record<string, unknown>;

  @Prop({ trim: true })
  signedDocumentUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const BillingContractSchema =
  SchemaFactory.createForClass(BillingContract);

BillingContractSchema.index({ organizationId: 1, status: 1, endDate: -1 });
BillingContractSchema.index({ organizationId: 1, contractNumber: 1 });
