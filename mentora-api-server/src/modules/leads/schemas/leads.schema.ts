import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import {
  Branch,
  LeadSource,
  LeadStage,
  Tenant,
} from '../../tenants/schemas/tenants.schema';

export type LeadDocument = HydratedDocument<Lead>;
export type LeadActivityDocument = HydratedDocument<LeadActivity>;
export type LeadAssignmentDocument = HydratedDocument<LeadAssignment>;

@Schema({ _id: false })
export class LeadAttachment {
  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ trim: true })
  fileName?: string;

  @Prop({ trim: true })
  mimeType?: string;

  @Prop({ default: 0 })
  size!: number;

  @Prop({
    enum: ['document', 'image', 'audio', 'voice_note', 'other'],
    default: 'document',
  })
  type!: string;
}

@Schema({
  collection: COLLECTION_NAMES.LEAD,
  timestamps: true,
})
export class Lead {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ lowercase: true, trim: true, index: true })
  email?: string;

  @Prop({ trim: true, index: true })
  phone?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ type: Types.ObjectId, ref: LeadSource.name, index: true })
  sourceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LeadStage.name, index: true })
  stageId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Branch.name, index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  interestedPrograms!: string[];

  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ type: [LeadAttachment], default: [] })
  attachments!: LeadAttachment[];

  @Prop({ type: [LeadAttachment], default: [] })
  voiceNotes!: LeadAttachment[];

  @Prop({ default: 0, min: 0, max: 100 })
  score!: number;

  @Prop({ type: Object, default: {} })
  scoreBreakdown!: Record<string, unknown>;

  @Prop({ enum: ['cold', 'warm', 'hot'], default: 'warm', index: true })
  temperature!: string;

  @Prop({
    enum: ['new', 'open', 'won', 'lost', 'duplicate'],
    default: 'new',
    index: true,
  })
  status!: string;

  @Prop()
  nextFollowUpAt?: Date;

  @Prop()
  lastContactedAt?: Date;

  @Prop()
  slaDueAt?: Date;

  @Prop({ enum: ['healthy', 'at_risk', 'breached'], default: 'healthy' })
  slaStatus!: string;

  @Prop({ type: Object, default: {} })
  utm!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  customFields!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ tenantId: 1, phone: 1 });
LeadSchema.index({ tenantId: 1, email: 1 });
LeadSchema.index({ tenantId: 1, createdAt: -1 });
LeadSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
LeadSchema.index({ tenantId: 1, assignedTo: 1, stageId: 1, createdAt: -1 });
LeadSchema.index({ tenantId: 1, nextFollowUpAt: 1 });
LeadSchema.index({ tenantId: 1, tags: 1 });
LeadSchema.index({ tenantId: 1, score: -1, temperature: 1 });

@Schema({
  collection: COLLECTION_NAMES.LEAD_ACTIVITY,
  timestamps: true,
})
export class LeadActivity {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Lead.name, required: true, index: true })
  leadId!: Types.ObjectId;

  @Prop({
    enum: [
      'lead_created',
      'assignment_changed',
      'stage_changed',
      'note_added',
      'call_made',
      'email_sent',
      'sms_sent',
      'whatsapp_sent',
      'task_created',
      'application_started',
      'payment_received',
    ],
    required: true,
  })
  type!: string;

  @Prop({ enum: ['inbound', 'outbound', 'internal'], default: 'internal' })
  direction!: string;

  @Prop({ trim: true })
  subject?: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  performedBy?: Types.ObjectId;

  @Prop({ default: Date.now, index: true })
  occurredAt!: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const LeadActivitySchema = SchemaFactory.createForClass(LeadActivity);
LeadActivitySchema.index({ tenantId: 1, leadId: 1, occurredAt: -1 });

@Schema({
  collection: COLLECTION_NAMES.LEAD_ASSIGNMENT,
  timestamps: true,
})
export class LeadAssignment {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

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
LeadAssignmentSchema.index({ tenantId: 1, leadId: 1, assignedAt: -1 });
LeadAssignmentSchema.index({ tenantId: 1, assignedTo: 1, assignedAt: -1 });
