import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  ChatMessageStatus,
  ChatMessageType,
  ChatModerationStatus,
} from '../enums/chat.enums';

@Schema({ _id: false })
export class MessageAttachment {
  @Prop({ required: true })
  url!: string;

  @Prop()
  name?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;
}

@Schema({ _id: false })
export class MessageReaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, maxlength: 16 })
  emoji!: string;

  @Prop({ default: Date.now })
  reactedAt!: Date;
}

@Schema({ collection: COLLECTION_NAMES.CHAT_MESSAGE, timestamps: true })
export class ChatMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true, index: true })
  roomId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  receiverId!: Types.ObjectId;

  @Prop({ type: String, enum: ChatMessageType, default: ChatMessageType.TEXT })
  type!: ChatMessageType;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  content!: string;

  @Prop()
  clientMessageId?: string;

  @Prop({ type: [MessageAttachment], default: [] })
  attachments!: MessageAttachment[];

  @Prop({ type: [MessageReaction], default: [] })
  reactions!: MessageReaction[];

  @Prop({
    type: String,
    enum: ChatModerationStatus,
    default: ChatModerationStatus.APPROVED,
    index: true,
  })
  moderationStatus!: ChatModerationStatus;

  @Prop({ type: [String], default: [] })
  moderationReasons!: string[];

  @Prop({ type: Types.ObjectId })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop({ trim: true, maxlength: 500 })
  reviewNote?: string;

  @Prop({ type: Types.ObjectId, ref: 'ChatMessage' })
  replyToMessageId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ChatMessageStatus,
    default: ChatMessageStatus.SENT,
  })
  status!: ChatMessageStatus;

  @Prop()
  readAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop({ default: false })
  isDeletedForEveryone!: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type ChatMessageDocument = ChatMessage & Document;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
ChatMessageSchema.index({ receiverId: 1, status: 1, roomId: 1 });
ChatMessageSchema.index({ moderationStatus: 1, createdAt: -1 });
ChatMessageSchema.index(
  { clientMessageId: 1, senderId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMessageId: { $exists: true } },
  },
);
