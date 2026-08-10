import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '../../organizations/schemas/organizations.schema';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({
  collection: COLLECTION_NAMES.ACTIVITY,
  timestamps: true,
})
export class Activity {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({
    enum: [
      'lead',
      'application',
      'student',
      'organization',
      'payment',
      'campaign',
      'general',
    ],
    default: 'general',
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
    enum: [
      'note',
      'call',
      'email',
      'sms',
      'whatsapp',
      'meeting',
      'stage_change',
      'assignment',
      'system',
    ],
    default: 'note',
    index: true,
  })
  activityType!: string;

  @Prop({
    enum: ['phone', 'email', 'sms', 'whatsapp', 'in_app', 'web', 'offline'],
    default: 'in_app',
    index: true,
  })
  channel!: string;

  @Prop({ trim: true })
  outcome?: string;

  @Prop({ trim: true })
  nextStep?: string;

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

  @Prop({ default: Date.now, index: true })
  occurredAt!: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({
    enum: ['open', 'in_progress', 'completed', 'archived'],
    default: 'completed',
    index: true,
  })
  status!: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ organizationId: 1, occurredAt: -1, createdAt: -1 });
ActivitySchema.index({ organizationId: 1, entityType: 1, entityId: 1 });
ActivitySchema.index({ organizationId: 1, ownerId: 1, status: 1 });
ActivitySchema.index({ organizationId: 1, activityType: 1, channel: 1 });
