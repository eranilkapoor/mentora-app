import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type FinanceLedgerEntryDocument = HydratedDocument<FinanceLedgerEntry>;

@Schema({ collection: COLLECTION_NAMES.FINANCE_LEDGER_ENTRY, timestamps: true })
export class FinanceLedgerEntry {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ trim: true }) description?: string;
  @Prop({
    enum: [
      'draft',
      'open',
      'in_progress',
      'approved',
      'rejected',
      'completed',
      'archived',
    ],
    default: 'open',
    index: true,
  })
  status!: string;
  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  relatedLeadId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Application', index: true })
  relatedApplicationId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;
  @Prop({
    enum: ['receivable', 'payable', 'refund', 'adjustment'],
    default: 'receivable',
    index: true,
  })
  ledgerType!: string;
  @Prop({ enum: ['debit', 'credit'], default: 'debit', index: true })
  entryType!: string;
  @Prop({ required: false, default: 0, min: 0 })
  amount!: number;
  @Prop({ trim: true, default: 'INR' })
  currency!: string;
  @Prop({ type: Types.ObjectId, ref: 'Invoice', index: true })
  invoiceId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Payment', index: true })
  paymentId?: Types.ObjectId;
  @Prop()
  dueDate?: Date;
  @Prop()
  paidAt?: Date;
  @Prop({
    enum: ['pending', 'settled', 'failed', 'reconciled'],
    default: 'pending',
  })
  settlementStatus!: string;
  @Prop({ enum: ['pending', 'exported', 'failed'], default: 'pending' })
  exportStatus!: string;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const FinanceLedgerEntrySchema =
  SchemaFactory.createForClass(FinanceLedgerEntry);
FinanceLedgerEntrySchema.index({ organizationId: 1, status: 1, dueAt: 1 });
FinanceLedgerEntrySchema.index({ organizationId: 1, dueAt: 1, createdAt: -1 });
FinanceLedgerEntrySchema.index({
  organizationId: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
FinanceLedgerEntrySchema.index({
  organizationId: 1,
  ownerId: 1,
  status: 1,
  dueAt: 1,
});
FinanceLedgerEntrySchema.index({
  organizationId: 1,
  branchId: 1,
  ledgerType: 1,
  createdAt: -1,
});
FinanceLedgerEntrySchema.index({
  organizationId: 1,
  settlementStatus: 1,
  dueDate: 1,
});
FinanceLedgerEntrySchema.index({
  organizationId: 1,
  relatedLeadId: 1,
  createdAt: -1,
});
FinanceLedgerEntrySchema.index({
  organizationId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
