import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { CommunicationAccess } from '../enums/settings-preferences.enums';

@Schema({
  collection: COLLECTION_NAMES.COMMUNICATION_SETTING,
  timestamps: true,
})
export class CommunicationSetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: CommunicationAccess,
    default: CommunicationAccess.ALL,
  })
  whoCanMessage!: CommunicationAccess;

  @Prop({
    type: String,
    enum: CommunicationAccess,
    default: CommunicationAccess.MATCHES_ONLY,
  })
  whoCanCall!: CommunicationAccess;

  @Prop({ default: true }) showReadReceipts!: boolean;
  @Prop({ default: true }) showTypingIndicator!: boolean;
  @Prop({ default: false }) autoReplyEnabled!: boolean;
  @Prop() autoReplyMessage?: string;
  @Prop({ default: true }) allowVoiceCalls!: boolean;
  @Prop({ default: false }) allowVideoCalls!: boolean;
}

export type CommunicationSettingDocument = CommunicationSetting & Document;
export const CommunicationSettingSchema =
  SchemaFactory.createForClass(CommunicationSetting);
