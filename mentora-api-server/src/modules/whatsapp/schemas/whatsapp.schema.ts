import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type WhatsappConversationDocument =
  HydratedDocument<WhatsappConversation>;

@Schema({
  collection: COLLECTION_NAMES.WHATSAPP_CONVERSATION,
  timestamps: true,
})
export class WhatsappConversation {
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
  @Prop({ trim: true, index: true })
  phoneNumber?: string;
  @Prop({ trim: true })
  templateName?: string;
  @Prop({ enum: ['inbound', 'outbound'], default: 'outbound', index: true })
  direction!: string;
  @Prop({
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
    default: 'queued',
    index: true,
  })
  deliveryStatus!: string;
  @Prop({ enum: ['unknown', 'opted_in', 'opted_out'], default: 'unknown' })
  optInStatus!: string;
  @Prop({ trim: true })
  providerMessageId?: string;
  @Prop({ trim: true })
  automationRule?: string;
  @Prop() lastMessageAt?: Date;
  @Prop({ default: 0, min: 0 })
  unreadCount!: number;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const WhatsappConversationSchema =
  SchemaFactory.createForClass(WhatsappConversation);
WhatsappConversationSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
WhatsappConversationSchema.index({
  organizationId: 1,
  dueAt: 1,
  createdAt: -1,
});
WhatsappConversationSchema.index({
  organizationId: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
WhatsappConversationSchema.index({
  organizationId: 1,
  ownerId: 1,
  status: 1,
  dueAt: 1,
});
WhatsappConversationSchema.index({
  organizationId: 1,
  phoneNumber: 1,
  lastMessageAt: -1,
});
WhatsappConversationSchema.index({
  organizationId: 1,
  deliveryStatus: 1,
  createdAt: -1,
});
WhatsappConversationSchema.index({
  organizationId: 1,
  relatedLeadId: 1,
  createdAt: -1,
});
WhatsappConversationSchema.index({
  organizationId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
