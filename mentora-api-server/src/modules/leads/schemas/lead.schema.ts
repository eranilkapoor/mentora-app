import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { LeadSource } from '@/common/crm/schemas/lead-source.schema';
import { LeadStage } from '@/common/crm/schemas/lead-stage.schema';
import { Branch } from '@/modules/organizations/schemas/branch.schema';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type LeadDocument = HydratedDocument<Lead>;

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
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

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
    enum: ['new', 'open', 'won', 'lost', 'duplicate', 'archived'],
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
LeadSchema.index({ organizationId: 1, phone: 1 });
LeadSchema.index({ organizationId: 1, email: 1 });
LeadSchema.index({ organizationId: 1, createdAt: -1 });
LeadSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
LeadSchema.index({
  organizationId: 1,
  assignedTo: 1,
  stageId: 1,
  createdAt: -1,
});
LeadSchema.index({ organizationId: 1, nextFollowUpAt: 1 });
LeadSchema.index({ organizationId: 1, tags: 1 });
LeadSchema.index({ organizationId: 1, score: -1, temperature: 1 });
