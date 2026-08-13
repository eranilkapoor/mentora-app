import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from './organization.schema';
import { Branch } from './branch.schema';

export type ChannelSettingDocument = HydratedDocument<ChannelSetting>;

@Schema({
  collection: COLLECTION_NAMES.CHANNEL_SETTING,
  timestamps: true,
})
export class ChannelSetting {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Branch.name, index: true })
  branchId?: Types.ObjectId;

  @Prop({
    enum: [
      'whatsapp',
      'sms',
      'email',
      'call_center',
      'payment',
      'calendar',
      'video',
      'analytics',
    ],
    required: true,
  })
  channel!: string;

  @Prop({ enum: ['disabled', 'sandbox', 'active'], default: 'sandbox' })
  status!: string;

  @Prop({ type: Object, default: {} })
  provider!: Record<string, unknown>;

  @Prop({ trim: true })
  providerKey?: string;

  @Prop({ trim: true })
  senderId?: string;

  @Prop({ trim: true })
  webhookUrl?: string;

  @Prop({ trim: true })
  credentialsRef?: string;

  @Prop({ type: Object, default: {} })
  compliance!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  limits!: Record<string, unknown>;

  @Prop({ type: Date })
  lastCheckedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const ChannelSettingSchema =
  SchemaFactory.createForClass(ChannelSetting);
ChannelSettingSchema.index(
  { organizationId: 1, branchId: 1, channel: 1 },
  { unique: true },
);
ChannelSettingSchema.index({ organizationId: 1, status: 1, channel: 1 });
