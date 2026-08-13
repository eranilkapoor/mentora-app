import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '../../organizations/schemas/organization.schema';

export type CommunicationDocument = HydratedDocument<Communication>;

@Schema({
  collection: COLLECTION_NAMES.COMMUNICATION,
  timestamps: true,
})
export class Communication {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({
    enum: ['lead', 'application', 'student', 'payment', 'general'],
    required: true,
    index: true,
  })
  entityType!: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId!: Types.ObjectId;

  @Prop({
    enum: ['email', 'sms', 'whatsapp', 'push', 'call', 'in_app'],
    required: true,
    index: true,
  })
  channel!: string;

  @Prop({ enum: ['inbound', 'outbound'], default: 'outbound' })
  direction!: string;

  @Prop({ trim: true })
  subject?: string;

  @Prop()
  content?: string;

  @Prop({
    enum: [
      'queued',
      'sent',
      'delivered',
      'read',
      'failed',
      'bounced',
      'archived',
    ],
    default: 'queued',
    index: true,
  })
  status!: string;
}

export const CommunicationSchema = SchemaFactory.createForClass(Communication);
CommunicationSchema.index({ organizationId: 1, createdAt: -1 });
CommunicationSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
CommunicationSchema.index({
  organizationId: 1,
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});
