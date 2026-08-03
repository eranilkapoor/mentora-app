import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { ReportDefinition } from './report-definition.schema';

export type ReportExportJobDocument = HydratedDocument<ReportExportJob>;

@Schema({
  collection: COLLECTION_NAMES.REPORT_EXPORT_JOB,
  timestamps: true,
})
export class ReportExportJob {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: ReportDefinition.name,
    required: true,
    index: true,
  })
  reportDefinitionId!: Types.ObjectId;

  @Prop({ enum: ['csv', 'xlsx', 'pdf'], default: 'csv' })
  format!: string;

  @Prop({
    enum: ['queued', 'running', 'completed', 'failed'],
    default: 'queued',
  })
  status!: string;

  @Prop({ type: Object, default: {} })
  parameters!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  result!: Record<string, unknown>;

  @Prop({ trim: true })
  error?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  requestedBy?: Types.ObjectId;

  @Prop({ index: true })
  completedAt?: Date;
}

export const ReportExportJobSchema =
  SchemaFactory.createForClass(ReportExportJob);
ReportExportJobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
ReportExportJobSchema.index({
  organizationId: 1,
  reportDefinitionId: 1,
  createdAt: -1,
});
