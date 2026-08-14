import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type ReportDefinitionDocument = HydratedDocument<ReportDefinition>;

@Schema({
  collection: COLLECTION_NAMES.REPORT_DEFINITION,
  timestamps: true,
})
export class ReportDefinition {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, index: true })
  moduleKey!: string;

  @Prop({ enum: ['table', 'funnel', 'summary', 'trend'], default: 'table' })
  reportType!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [String], default: [] })
  columns!: string[];

  @Prop({ type: Object, default: {} })
  filters!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  schedule!: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  recipients!: string[];

  @Prop({ enum: ['private', 'team', 'organization'], default: 'organization' })
  visibility!: string;

  @Prop({ default: false })
  isSystem!: boolean;

  @Prop({ enum: ['draft', 'active', 'archived'], default: 'draft' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const ReportDefinitionSchema =
  SchemaFactory.createForClass(ReportDefinition);
ReportDefinitionSchema.index({ organizationId: 1, moduleKey: 1, status: 1 });
ReportDefinitionSchema.index({ organizationId: 1, visibility: 1, status: 1 });
