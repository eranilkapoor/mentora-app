import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type FieldVisitDocument = HydratedDocument<FieldVisit>;

@Schema({ collection: COLLECTION_NAMES.FIELD_VISIT, timestamps: true })
export class FieldVisit {
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
  @Prop({ type: Types.ObjectId, ref: 'Team', index: true })
  teamId?: Types.ObjectId;
  @Prop({
    enum: ['school_visit', 'partner_visit', 'fair', 'home_visit', 'other'],
    default: 'school_visit',
    index: true,
  })
  visitType!: string;
  @Prop({ trim: true })
  partnerName?: string;
  @Prop({ trim: true })
  location?: string;
  @Prop({ type: Object, default: {} })
  geo!: Record<string, unknown>;
  @Prop() checkInAt?: Date;
  @Prop() checkOutAt?: Date;
  @Prop({ trim: true })
  outcome?: string;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const FieldVisitSchema = SchemaFactory.createForClass(FieldVisit);
FieldVisitSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
FieldVisitSchema.index({ organizationId: 1, dueAt: 1, createdAt: -1 });
FieldVisitSchema.index({
  organizationId: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
FieldVisitSchema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
FieldVisitSchema.index({ organizationId: 1, branchId: 1, visitType: 1 });
FieldVisitSchema.index({ organizationId: 1, ownerId: 1, checkInAt: -1 });
FieldVisitSchema.index({ organizationId: 1, relatedLeadId: 1, createdAt: -1 });
FieldVisitSchema.index({
  organizationId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
