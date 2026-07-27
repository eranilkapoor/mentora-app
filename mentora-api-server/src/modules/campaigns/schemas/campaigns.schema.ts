import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Tenant } from '../../tenants/schemas/tenants.schema';

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({
  collection: COLLECTION_NAMES.CAMPAIGN,
  timestamps: true,
})
export class Campaign {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    enum: ['email', 'sms', 'whatsapp', 'push', 'ads', 'landing_page'],
    required: true,
    index: true,
  })
  channel!: string;

  @Prop({
    enum: ['draft', 'scheduled', 'running', 'completed', 'paused'],
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

  @Prop()
  scheduledAt?: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ tenantId: 1, channel: 1, status: 1 });
CampaignSchema.index({ tenantId: 1, scheduledAt: 1, status: 1 });
