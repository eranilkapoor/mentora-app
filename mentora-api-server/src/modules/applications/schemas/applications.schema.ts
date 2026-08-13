import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Lead } from '../../leads/schemas/lead.schema';
import { Organization } from '../../organizations/schemas/organization.schema';

export type ApplicationDocument = HydratedDocument<Application>;

@Schema({
  collection: COLLECTION_NAMES.APPLICATION,
  timestamps: true,
})
export class Application {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  applicationNumber!: string;

  @Prop({ type: Types.ObjectId, ref: Lead.name, index: true })
  leadId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  courseOffering!: string;

  @Prop({
    enum: [
      'draft',
      'submitted',
      'under_review',
      'document_verification',
      'interview',
      'offer_issued',
      'admission_confirmed',
      'rejected',
      'withdrawn',
    ],
    default: 'draft',
    index: true,
  })
  status!: string;

  @Prop({ default: 0, min: 0, max: 100 })
  completenessPercentage!: number;

  @Prop()
  submittedAt?: Date;

  @Prop({ type: Object, default: {} })
  applicantProfile!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  formResponses!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  documentRequirements!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  reviewHistory!: Record<string, unknown>[];

  @Prop({ type: Object, default: {} })
  approval!: Record<string, unknown>;

  @Prop({ default: false, index: true })
  isLocked!: boolean;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index(
  { organizationId: 1, applicationNumber: 1 },
  { unique: true },
);
ApplicationSchema.index({ organizationId: 1, createdAt: -1 });
ApplicationSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
