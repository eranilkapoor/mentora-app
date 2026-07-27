import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Tenant } from '../../tenants/schemas/tenants.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({
  collection: COLLECTION_NAMES.TASK,
  timestamps: true,
})
export class Task {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

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
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ tenantId: 1, assignedTo: 1, status: 1, dueAt: 1 });
