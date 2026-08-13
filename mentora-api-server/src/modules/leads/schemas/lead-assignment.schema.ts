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
  previousOwner?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', index: true })
  teamId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', index: true })
  departmentId?: Types.ObjectId;

  @Prop({
    enum: [
      'manual',
      'round_robin',
      'course_based',
      'branch_based',
      'location_based',
      'branch_preference_based',
      'source_based',
      'campaign_based',
      'language_based',
      'capacity_based',
      'working_hours',
      'lead_score_based',
      'existing_relationship',
      'workflow',
    ],
    default: 'manual',
  })
  assignmentMethod!: string;

  @Prop({ default: Date.now })
  assignedAt!: Date;

  @Prop({ trim: true })
  assignmentReason?: string;

  @Prop({ enum: ['active', 'reassigned', 'released'], default: 'active' })
  status!: string;

  @Prop({ type: Object, default: {} })
  capacitySnapshot!: Record<string, unknown>;
}

export const LeadAssignmentSchema =
  SchemaFactory.createForClass(LeadAssignment);
LeadAssignmentSchema.index({ organizationId: 1, leadId: 1, assignedAt: -1 });
LeadAssignmentSchema.index({
  organizationId: 1,
  assignedTo: 1,
  assignedAt: -1,
});
LeadAssignmentSchema.index({ organizationId: 1, teamId: 1, assignedAt: -1 });
LeadAssignmentSchema.index({ organizationId: 1, status: 1, assignedAt: -1 });
