import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '../../organizations/schemas/organizations.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({
  collection: COLLECTION_NAMES.TASK,
  timestamps: true,
})
export class Task {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({
    enum: ['lead', 'application', 'student', 'payment', 'campaign', 'general'],
    required: true,
    index: true,
  })
  entityType!: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedBy?: Types.ObjectId;

  // Denormalized from the assignee's active organization membership at
  // creation time, so DataScope filtering (see common/rbac) can scope task
  // visibility by branch/department/team without a join on every query.
  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', index: true })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', index: true })
  teamId?: Types.ObjectId;

  @Prop({
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  })
  priority!: string;

  @Prop({
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open',
    index: true,
  })
  status!: string;

  @Prop({ index: true })
  dueAt?: Date;

  @Prop()
  reminderAt?: Date;

  @Prop()
  recurringRule?: string;

  @Prop({ type: [Object], default: [] })
  comments!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  escalations!: Record<string, unknown>[];

  @Prop({ enum: ['todo', 'doing', 'blocked', 'done'], default: 'todo' })
  boardColumn!: string;

  @Prop({ enum: ['healthy', 'at_risk', 'breached'], default: 'healthy' })
  slaStatus!: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ organizationId: 1, assignedTo: 1, status: 1, dueAt: 1 });
TaskSchema.index({ organizationId: 1, boardColumn: 1, priority: 1 });
TaskSchema.index({ organizationId: 1, dueAt: 1, createdAt: -1 });
TaskSchema.index({ organizationId: 1, boardColumn: 1, dueAt: 1, priority: -1 });
TaskSchema.index({
  organizationId: 1,
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});
