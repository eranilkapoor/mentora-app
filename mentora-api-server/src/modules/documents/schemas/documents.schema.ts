import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Tenant } from '@/modules/tenants/schemas/tenants.schema';

export type CrmDocumentDocument = HydratedDocument<CrmDocument>;

@Schema({ collection: COLLECTION_NAMES.CRM_DOCUMENT, timestamps: true })
export class CrmDocument {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({
    enum: ['lead', 'application', 'admission', 'student', 'scholarship'],
    required: true,
    index: true,
  })
  entityType!: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    enum: ['identity', 'academic', 'payment', 'consent', 'other'],
    default: 'other',
    index: true,
  })
  category!: string;

  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ trim: true })
  mimeType?: string;

  @Prop({ default: 0 })
  size!: number;

  @Prop({
    enum: [
      'required',
      'submitted',
      'verified',
      'rejected',
      'expired',
      'archived',
    ],
    default: 'submitted',
    index: true,
  })
  status!: string;

  @Prop({ type: Object, default: {} })
  ocrResult!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  verification!: Record<string, unknown>;

  @Prop({ default: 1, min: 1 })
  version!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  uploadedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;
}

export const CrmDocumentSchema = SchemaFactory.createForClass(CrmDocument);
CrmDocumentSchema.index({ tenantId: 1, updatedAt: -1 });
CrmDocumentSchema.index({ tenantId: 1, status: 1, updatedAt: -1 });
CrmDocumentSchema.index({ tenantId: 1, entityType: 1, entityId: 1, status: 1 });
CrmDocumentSchema.index({
  tenantId: 1,
  entityType: 1,
  entityId: 1,
  updatedAt: -1,
});
CrmDocumentSchema.index({ tenantId: 1, category: 1, status: 1 });
