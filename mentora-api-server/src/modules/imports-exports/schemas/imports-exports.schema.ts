import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type ImportExportJobDocument = HydratedDocument<ImportExportJob>;

@Schema({ collection: COLLECTION_NAMES.IMPORT_EXPORT_JOB, timestamps: true })
export class ImportExportJob {
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
  @Prop({ required: false, trim: true, index: true })
  moduleKey?: string;
  @Prop({
    enum: ['import', 'export'],
    default: 'import',
    index: true,
  })
  operation!: string;
  @Prop({ trim: true })
  fileName?: string;
  @Prop({ trim: true })
  fileUrl?: string;
  @Prop({ default: 0, min: 0 })
  totalRows!: number;
  @Prop({ default: 0, min: 0 })
  processedRows!: number;
  @Prop({ default: 0, min: 0 })
  successRows!: number;
  @Prop({ default: 0, min: 0 })
  failedRows!: number;
  @Prop({
    enum: ['skip', 'fail_fast', 'partial_commit'],
    default: 'partial_commit',
  })
  errorPolicy!: string;
  @Prop({ type: [Object], default: [] })
  errors!: Record<string, unknown>[];
  @Prop({ trim: true })
  resultUrl?: string;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [], index: true }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const ImportExportJobSchema =
  SchemaFactory.createForClass(ImportExportJob);
ImportExportJobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
ImportExportJobSchema.index({ organizationId: 1, ownerId: 1, status: 1 });
ImportExportJobSchema.index({
  organizationId: 1,
  moduleKey: 1,
  operation: 1,
  createdAt: -1,
});
