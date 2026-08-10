import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '../../organizations/schemas/organizations.schema';

export type FollowUpDocument = HydratedDocument<FollowUp>;

@Schema({
  collection: COLLECTION_NAMES.FOLLOW_UP,
  timestamps: true,
})
export class FollowUp {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({
    enum: ['lead', 'application', 'student', 'payment', 'campaign', 'general'],
    default: 'lead',
    index: true,
  })
  entityType!: string;

  @Prop({ type: Types.ObjectId, index: true })
  entityId?: Types.ObjectId;

  @Prop({ trim: true })
  entityName?: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({
    enum: ['call', 'email', 'sms', 'whatsapp', 'meeting', 'task', 'other'],
    default: 'call',
    index: true,
  })
  followUpType!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;

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
    enum: ['open', 'in_progress', 'completed', 'cancelled', 'archived'],
    default: 'open',
    index: true,
  })
  status!: string;

  @Prop({ index: true })
  dueAt?: Date;

  @Prop()
  reminderAt?: Date;

  @Prop({
    enum: ['email', 'sms', 'whatsapp', 'in_app', 'phone'],
    default: 'in_app',
  })
  reminderChannel!: string;

  @Prop({ trim: true })
  escalationRule?: string;

  @Prop({ trim: true })
  completionNote?: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop()
  completedAt?: Date;
}

export const FollowUpSchema = SchemaFactory.createForClass(FollowUp);
FollowUpSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
FollowUpSchema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
FollowUpSchema.index({ organizationId: 1, entityType: 1, entityId: 1 });
FollowUpSchema.index({ organizationId: 1, priority: -1, dueAt: 1 });
