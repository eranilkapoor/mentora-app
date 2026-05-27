import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

@Schema({ collection: COLLECTIONS.COMMUNICATION_SETTING, timestamps: true })
export class CommunicationSettings {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['all', 'matches_only', 'contacts_only', 'no_one'],
    default: 'all',
  })
  whoCanMessage!: string;

  @Prop({
    type: String,
    enum: ['all', 'matches_only', 'contacts_only', 'no_one'],
    default: 'matches_only',
  })
  whoCanCall!: string;

  @Prop({ default: true }) showReadReceipts!: boolean;
  @Prop({ default: true }) showTypingIndicator!: boolean;
  @Prop({ default: false }) autoReplyEnabled!: boolean;
  @Prop() autoReplyMessage?: string;
  @Prop({ default: true }) allowVoiceCalls!: boolean;
  @Prop({ default: false }) allowVideoCalls!: boolean;
}

export type CommunicationSettingsDocument = CommunicationSettings & Document;
export const CommunicationSettingsSchema = SchemaFactory.createForClass(
  CommunicationSettings,
);
