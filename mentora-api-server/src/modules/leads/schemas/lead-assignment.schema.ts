import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { Lead } from './lead.schema';

export type LeadAssignmentDocument = HydratedDocument<LeadAssignment>;

@Schema({
  collection: COLLECTION_NAMES.LEAD_ASSIGNMENT,
  timestamps: true,
})
export class LeadAssignment {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Lead.name, required: true, index: true })
  leadId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedBy?: Types.ObjectId;

  @Prop({
    enum: [
      'manual',
      'round_robin',
      'course_based',
      'branch_based',
      'location_based',
      'workflow',
    ],
    default: 'manual',
  })
  assignmentMethod!: string;

  @Prop({ default: Date.now })
  assignedAt!: Date;
}

export const LeadAssignmentSchema =
  SchemaFactory.createForClass(LeadAssignment);
LeadAssignmentSchema.index({ organizationId: 1, leadId: 1, assignedAt: -1 });
LeadAssignmentSchema.index({
  organizationId: 1,
  assignedTo: 1,
  assignedAt: -1,
});
