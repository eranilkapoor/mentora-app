import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '../../organizations/schemas/organization.schema';
import { LeadSource } from '@/common/crm/schemas/lead-source.schema';
import { LeadStage } from '@/common/crm/schemas/lead-stage.schema';
import { User } from '../../auth/schemas/user.schema';

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({
  collection: COLLECTION_NAMES.CAMPAIGN,
  timestamps: true,
})
export class Campaign {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: ['email', 'sms', 'whatsapp', 'push', 'ads', 'landing_page'],
    required: true,
    index: true,
  })
  channel!: string;

  @Prop({
    enum: ['draft', 'scheduled', 'running', 'completed', 'paused', 'archived'],
    default: 'draft',
    index: true,
  })
  status!: string;

  @Prop({ type: Object, default: {} })
  metrics!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  audience!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  utm!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  variants!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  dripSteps!: Record<string, unknown>[];

  @Prop({ type: Object, default: {} })
  roi!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: LeadSource.name, index: true })
  sourceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LeadStage.name, index: true })
  leadStageId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  ownerId?: Types.ObjectId;

  @Prop({ type: Number, min: 0, default: 0 })
  budget!: number;

  @Prop({ type: Number, min: 0, default: 0 })
  spend!: number;

  @Prop({ trim: true })
  landingPageUrl?: string;

  @Prop({ type: [String], default: [] })
  conversionTags!: string[];

  @Prop({ trim: true, default: 'sandbox' })
  provider!: string;

  @Prop({ trim: true })
  providerCampaignId?: string;

  @Prop({
    enum: ['draft', 'pending_approval', 'approved', 'rejected'],
    default: 'draft',
    index: true,
  })
  approvalStatus!: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  archivedAt?: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ organizationId: 1, createdAt: -1 });
CampaignSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
CampaignSchema.index({ organizationId: 1, channel: 1, status: 1 });
CampaignSchema.index({ organizationId: 1, scheduledAt: 1, status: 1 });
CampaignSchema.index({ organizationId: 1, sourceId: 1, createdAt: -1 });
CampaignSchema.index({ organizationId: 1, ownerId: 1, status: 1 });
