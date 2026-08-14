import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type InterviewDocument = HydratedDocument<Interview>;

@Schema({ collection: COLLECTION_NAMES.INTERVIEW, timestamps: true })
export class Interview {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ trim: true }) description?: string;
  @Prop({
    enum: [
      'draft',
      'open',
      'in_progress',
      'approved',
      'rejected',
      'completed',
      'archived',
    ],
    default: 'open',
    index: true,
  })
  status!: string;
  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  relatedLeadId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Application', index: true })
  relatedApplicationId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;
  @Prop({ enum: ['online', 'offline', 'phone'], default: 'online' })
  mode!: string;
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  panelistIds!: Types.ObjectId[];
  @Prop({ trim: true })
  applicantName?: string;
  @Prop({ default: 0, min: 0, max: 100 })
  score!: number;
  @Prop({
    enum: ['pending', 'selected', 'rejected', 'waitlisted', 'reschedule'],
    default: 'pending',
    index: true,
  })
  result!: string;
  @Prop({ trim: true })
  recommendation?: string;
  @Prop({ trim: true })
  location?: string;
  @Prop({ trim: true })
  meetingUrl?: string;
  @Prop({ index: true })
  scheduledAt?: Date;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const InterviewSchema = SchemaFactory.createForClass(Interview);
InterviewSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
InterviewSchema.index({ organizationId: 1, dueAt: 1, createdAt: -1 });
InterviewSchema.index({
  organizationId: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
InterviewSchema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
InterviewSchema.index({ organizationId: 1, branchId: 1, scheduledAt: 1 });
InterviewSchema.index({ organizationId: 1, result: 1, scheduledAt: -1 });
InterviewSchema.index({ organizationId: 1, relatedLeadId: 1, createdAt: -1 });
InterviewSchema.index({
  organizationId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
