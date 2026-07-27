import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Tenant } from '@/modules/tenants/schemas/tenants.schema';

export type WorkflowRuleDocument = HydratedDocument<WorkflowRule>;
export type WorkflowExecutionDocument = HydratedDocument<WorkflowExecution>;

@Schema({
  collection: COLLECTION_NAMES.WORKFLOW_RULE,
  timestamps: true,
})
export class WorkflowRule {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

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

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const WorkflowRuleSchema = SchemaFactory.createForClass(WorkflowRule);
WorkflowRuleSchema.index({ tenantId: 1, moduleKey: 1, status: 1 });
WorkflowRuleSchema.index({ tenantId: 1, trigger: 1, priority: -1 });

@Schema({
  collection: COLLECTION_NAMES.WORKFLOW_EXECUTION,
  timestamps: true,
})
export class WorkflowExecution {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: WorkflowRule.name,
    required: true,
    index: true,
  })
  workflowRuleId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  moduleKey!: string;

  @Prop({ required: true, trim: true, index: true })
  trigger!: string;

  @Prop({ trim: true, index: true })
  targetId?: string;

  @Prop({
    enum: ['queued', 'running', 'succeeded', 'failed', 'skipped'],
    default: 'queued',
  })
  status!: string;

  @Prop({ type: Object, default: {} })
  input!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  output!: Record<string, unknown>;

  @Prop({ trim: true })
  error?: string;

  @Prop({ default: Date.now, index: true })
  executedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  executedBy?: Types.ObjectId;
}

export const WorkflowExecutionSchema =
  SchemaFactory.createForClass(WorkflowExecution);
WorkflowExecutionSchema.index({ tenantId: 1, moduleKey: 1, executedAt: -1 });
WorkflowExecutionSchema.index({
  tenantId: 1,
  workflowRuleId: 1,
  executedAt: -1,
});
