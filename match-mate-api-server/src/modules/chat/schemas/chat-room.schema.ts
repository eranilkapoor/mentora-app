import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChatRoom extends Document {
  @Prop({ type: [Types.ObjectId], required: true })
  participants: Types.ObjectId[];

  @Prop()
  lastMessage?: string;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);