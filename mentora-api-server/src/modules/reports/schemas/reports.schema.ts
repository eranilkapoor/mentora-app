import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Tenant } from '@/modules/tenants/schemas/tenants.schema';

export type ReportDefinitionDocument = HydratedDocument<ReportDefinition>;
export type ReportExportJobDocument = HydratedDocument<ReportExportJob>;

@Schema({
  collection: COLLECTION_NAMES.REPORT_DEFINITION,
  timestamps: true,
})
export class ReportDefinition {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, index: true })
  moduleKey!: string;

  @Prop({ enum: ['table', 'funnel', 'summary', 'trend'], default: 'table' })
  reportType!: string;

  @Prop({ type: [String], default: [] })
  columns!: string[];

  @Prop({ type: Object, default: {} })
  filters!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  schedule!: Record<string, unknown>;

  @Prop({ enum: ['draft', 'active', 'archived'], default: 'draft' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const ReportDefinitionSchema =
  SchemaFactory.createForClass(ReportDefinition);
ReportDefinitionSchema.index({ tenantId: 1, moduleKey: 1, status: 1 });

@Schema({
  collection: COLLECTION_NAMES.REPORT_EXPORT_JOB,
  timestamps: true,
})
export class ReportExportJob {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

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
ReportExportJobSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
ReportExportJobSchema.index({
  tenantId: 1,
  reportDefinitionId: 1,
  createdAt: -1,
});
