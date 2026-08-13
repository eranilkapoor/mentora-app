import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { Lead } from './lead.schema';

export type LeadActivityDocument = HydratedDocument<LeadActivity>;

@Schema({
  collection: COLLECTION_NAMES.LEAD_ACTIVITY,
  timestamps: true,
})
export class LeadActivity {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

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
      'follow_up_scheduled',
      'document_added',
      'duplicate_merged',
      'lead_lost',
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

  @Prop({ trim: true })
  channel?: string;

  @Prop({ trim: true })
  outcome?: string;

  @Prop()
  dueAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Task', index: true })
  taskId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Communication', index: true })
  communicationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  performedBy?: Types.ObjectId;

  @Prop({ default: Date.now, index: true })
  occurredAt!: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const LeadActivitySchema = SchemaFactory.createForClass(LeadActivity);
LeadActivitySchema.index({ organizationId: 1, leadId: 1, occurredAt: -1 });
LeadActivitySchema.index({ organizationId: 1, type: 1, occurredAt: -1 });
LeadActivitySchema.index({ organizationId: 1, performedBy: 1, occurredAt: -1 });
