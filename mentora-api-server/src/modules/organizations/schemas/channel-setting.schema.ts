import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from './organization.schema';

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

  @Prop({
    enum: ['whatsapp', 'sms', 'email', 'call_center', 'payment', 'calendar'],
    required: true,
  })
  channel!: string;

  @Prop({ enum: ['disabled', 'sandbox', 'active'], default: 'sandbox' })
  status!: string;

  @Prop({ type: Object, default: {} })
  provider!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  limits!: Record<string, unknown>;
}

export const ChannelSettingSchema =
  SchemaFactory.createForClass(ChannelSetting);
ChannelSettingSchema.index({ organizationId: 1, channel: 1 }, { unique: true });
ChannelSettingSchema.index({ organizationId: 1, status: 1, channel: 1 });
