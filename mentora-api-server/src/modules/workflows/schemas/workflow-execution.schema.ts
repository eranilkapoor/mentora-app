import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { WorkflowRule } from './workflow-rule.schema';

export type WorkflowExecutionDocument = HydratedDocument<WorkflowExecution>;

@Schema({
  collection: COLLECTION_NAMES.WORKFLOW_EXECUTION,
  timestamps: true,
})
export class WorkflowExecution {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

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

  @Prop({ default: 0, min: 0 })
  attempt!: number;

  @Prop()
  nextRetryAt?: Date;

  @Prop({ default: Date.now, index: true })
  executedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  executedBy?: Types.ObjectId;
}

export const WorkflowExecutionSchema =
  SchemaFactory.createForClass(WorkflowExecution);
WorkflowExecutionSchema.index({
  organizationId: 1,
  moduleKey: 1,
  executedAt: -1,
});
WorkflowExecutionSchema.index({ organizationId: 1, executedAt: -1 });
WorkflowExecutionSchema.index({
  organizationId: 1,
  workflowRuleId: 1,
  executedAt: -1,
});
