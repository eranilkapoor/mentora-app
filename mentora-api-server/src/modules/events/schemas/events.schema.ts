import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type CrmEventDocument = HydratedDocument<CrmEvent>;

@Schema({ collection: COLLECTION_NAMES.EVENT, timestamps: true })
export class CrmEvent {
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
  @Prop({
    enum: ['webinar', 'seminar', 'open_house', 'workshop', 'exam', 'other'],
    default: 'webinar',
    index: true,
  })
  eventType!: string;
  @Prop({ index: true })
  startAt?: Date;
  @Prop()
  endAt?: Date;
  @Prop({ trim: true })
  location?: string;
  @Prop({ default: 0, min: 0 })
  capacity!: number;
  @Prop({ default: 0, min: 0 })
  registrationCount!: number;
  @Prop({ enum: ['public', 'private', 'internal'], default: 'public' })
  visibility!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  hostId?: Types.ObjectId;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const CrmEventSchema = SchemaFactory.createForClass(CrmEvent);
CrmEventSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
CrmEventSchema.index({ organizationId: 1, dueAt: 1, createdAt: -1 });
CrmEventSchema.index({ organizationId: 1, status: 1, dueAt: 1, createdAt: -1 });
CrmEventSchema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
CrmEventSchema.index({ organizationId: 1, branchId: 1, startAt: 1 });
CrmEventSchema.index({ organizationId: 1, eventType: 1, status: 1 });
CrmEventSchema.index({ organizationId: 1, relatedLeadId: 1, createdAt: -1 });
CrmEventSchema.index({
  organizationId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
