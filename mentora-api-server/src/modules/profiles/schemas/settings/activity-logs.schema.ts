import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  ActivityAction,
  ActivityCategory,
  ActivityPlatform,
} from '../../enums/activity-log.enums';

@Schema({ collection: COLLECTION_NAMES.ACTIVITY_LOG, timestamps: true })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ enum: ActivityCategory })
  category!: ActivityCategory;

  @Prop({ enum: ActivityAction, required: true })
  action?: ActivityAction;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  ip?: string;

  @Prop()
  device?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  requestId?: string;

  @Prop()
  correlationId?: string;

  @Prop({ enum: ActivityPlatform })
  platform?: ActivityPlatform;
}

export type ActivityLogDocument = ActivityLog & Document;
export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1 });
