import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type ScholarshipApplicationDocument =
  HydratedDocument<ScholarshipApplication>;

@Schema({
  collection: COLLECTION_NAMES.SCHOLARSHIP_APPLICATION,
  timestamps: true,
})
export class ScholarshipApplication {
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
  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', index: true })
  studentId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;
  @Prop({ trim: true, index: true })
  schemeName?: string;
  @Prop({
    enum: ['not_checked', 'eligible', 'ineligible', 'needs_review'],
    default: 'not_checked',
    index: true,
  })
  eligibilityStatus!: string;
  @Prop({ enum: ['pending', 'verified', 'rejected'], default: 'pending' })
  verificationStatus!: string;
  @Prop({ default: 0, min: 0 })
  requestedAmount!: number;
  @Prop({ default: 0, min: 0 })
  approvedAmount!: number;
  @Prop({ default: 0, min: 0, max: 100 })
  discountPercent!: number;
  @Prop({ default: 1, min: 1 })
  approvalLevel!: number;
  @Prop() awardDate?: Date;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const ScholarshipApplicationSchema = SchemaFactory.createForClass(
  ScholarshipApplication,
);
ScholarshipApplicationSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
ScholarshipApplicationSchema.index({
  organizationId: 1,
  dueAt: 1,
  createdAt: -1,
});
ScholarshipApplicationSchema.index({
  organizationId: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
ScholarshipApplicationSchema.index({
  organizationId: 1,
  ownerId: 1,
  status: 1,
  dueAt: 1,
});
ScholarshipApplicationSchema.index({
  organizationId: 1,
  schemeName: 1,
  status: 1,
});
ScholarshipApplicationSchema.index({
  organizationId: 1,
  branchId: 1,
  eligibilityStatus: 1,
});
ScholarshipApplicationSchema.index({
  organizationId: 1,
  relatedLeadId: 1,
  createdAt: -1,
});
ScholarshipApplicationSchema.index({
  organizationId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
