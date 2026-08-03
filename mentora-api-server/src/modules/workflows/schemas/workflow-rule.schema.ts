import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type WorkflowRuleDocument = HydratedDocument<WorkflowRule>;

@Schema({
  collection: COLLECTION_NAMES.WORKFLOW_RULE,
  timestamps: true,
})
export class WorkflowRule {
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

  @Prop({ required: true, trim: true, index: true })
  trigger!: string;

  @Prop({ type: Object, default: {} })
  conditions!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  actions!: Record<string, unknown>[];

  @Prop({ enum: ['draft', 'active', 'paused', 'archived'], default: 'draft' })
  status!: string;

  @Prop({ default: 0, min: 0 })
  priority!: number;

  @Prop({ type: Object, default: {} })
  retryPolicy!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  slaPolicy!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  testMode!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const WorkflowRuleSchema = SchemaFactory.createForClass(WorkflowRule);
WorkflowRuleSchema.index({ organizationId: 1, moduleKey: 1, status: 1 });
WorkflowRuleSchema.index({ organizationId: 1, trigger: 1, priority: -1 });
WorkflowRuleSchema.index({ organizationId: 1, priority: -1, createdAt: -1 });
WorkflowRuleSchema.index({
  organizationId: 1,
  moduleKey: 1,
  priority: -1,
  createdAt: -1,
});
WorkflowRuleSchema.index({
  organizationId: 1,
  moduleKey: 1,
  trigger: 1,
  status: 1,
  priority: -1,
  createdAt: 1,
});
