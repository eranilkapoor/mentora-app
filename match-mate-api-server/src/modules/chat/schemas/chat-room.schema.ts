import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { ChatRoomStatus, ChatRoomType } from '../enums/chat.enums';

@Schema({ _id: false })
export class ChatParticipantState {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  lastReadMessageId?: Types.ObjectId;

  @Prop()
  lastReadAt?: Date;

  @Prop({ default: 0 })
  unreadCount!: number;

  @Prop()
  archivedAt?: Date;

  @Prop()
  pinnedAt?: Date;

  @Prop()
  mutedUntil?: Date;
}

@Schema({ collection: COLLECTION_NAMES.CHAT_ROOM, timestamps: true })
export class ChatRoom extends Document {
  @Prop({ required: true, unique: true, index: true })
  participantHash!: string;

  @Prop({ type: String, enum: ChatRoomType, default: ChatRoomType.DIRECT })
  roomType!: ChatRoomType;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants!: Types.ObjectId[];

  @Prop({ type: [ChatParticipantState], default: [] })
  participantStates!: ChatParticipantState[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Match' })
  startedFromMatchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  requestedById?: Types.ObjectId;

  @Prop()
  requestedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  respondedById?: Types.ObjectId;

  @Prop()
  respondedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'ChatMessage' })
  requestMessageId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ChatRoomStatus,
    default: ChatRoomStatus.ACTIVE,
    index: true,
  })
  status!: ChatRoomStatus;

  @Prop({ type: Types.ObjectId, ref: 'ChatMessage' })
  lastMessageId?: Types.ObjectId;

  @Prop()
  lastMessageText?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastMessageSenderId?: Types.ObjectId;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ default: 0 })
  messageCount!: number;

  @Prop({ default: Date.now })
  lastActivityAt!: Date;
}

export type ChatRoomDocument = ChatRoom & Document;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

ChatRoomSchema.index({ participants: 1, status: 1, lastActivityAt: -1 });
ChatRoomSchema.index({
  participants: 1,
  lastActivityAt: -1,
  updatedAt: -1,
  createdAt: -1,
});
ChatRoomSchema.index({ 'participantStates.userId': 1, lastActivityAt: -1 });
