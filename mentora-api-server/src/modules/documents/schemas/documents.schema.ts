import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type DocumentRecordDocument = HydratedDocument<DocumentRecord>;

@Schema({ collection: COLLECTION_NAMES.DOCUMENT, timestamps: true })
export class DocumentRecord {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

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

  @Prop({ trim: true })
  documentNumber?: string;

  @Prop()
  issuedAt?: Date;

  @Prop()
  expiresAt?: Date;

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

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ default: false })
  requiredForAdmission!: boolean;

  @Prop({ default: 1, min: 1 })
  version!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  uploadedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;
}

export const DocumentRecordSchema =
  SchemaFactory.createForClass(DocumentRecord);
DocumentRecordSchema.index({ organizationId: 1, updatedAt: -1 });
DocumentRecordSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
DocumentRecordSchema.index({
  organizationId: 1,
  entityType: 1,
  entityId: 1,
  status: 1,
});
DocumentRecordSchema.index({
  organizationId: 1,
  entityType: 1,
  entityId: 1,
  updatedAt: -1,
});
DocumentRecordSchema.index({ organizationId: 1, category: 1, status: 1 });
DocumentRecordSchema.index({ organizationId: 1, expiresAt: 1, status: 1 });
