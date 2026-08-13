import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type MeetingDocument = HydratedDocument<Meeting>;

@Schema({ collection: COLLECTION_NAMES.MEETING, timestamps: true })
export class Meeting {
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
  @Prop({
    enum: ['counselling', 'demo', 'parent', 'internal', 'partner', 'other'],
    default: 'counselling',
    index: true,
  })
  meetingType!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Department', index: true })
  departmentId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Team', index: true })
  teamId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  relatedLeadId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Application', index: true })
  relatedApplicationId?: Types.ObjectId;
  @Prop({ index: true }) dueAt?: Date;
  @Prop({ index: true }) startAt?: Date;
  @Prop() endAt?: Date;
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  attendeeIds!: Types.ObjectId[];
  @Prop({ type: [String], default: [] })
  externalAttendees!: string[];
  @Prop({ trim: true }) location?: string;
  @Prop({
    enum: ['offline', 'zoom', 'google_meet', 'teams', 'other'],
    default: 'offline',
  })
  provider!: string;
  @Prop({ trim: true }) meetingUrl?: string;
  @Prop({ trim: true }) calendarEventId?: string;
  @Prop({ trim: true }) outcome?: string;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [], index: true }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
MeetingSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
MeetingSchema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
MeetingSchema.index({ organizationId: 1, relatedLeadId: 1, createdAt: -1 });
MeetingSchema.index({ organizationId: 1, branchId: 1, status: 1, startAt: 1 });
MeetingSchema.index({ organizationId: 1, meetingType: 1, startAt: 1 });
