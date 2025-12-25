import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage } from './schemas/chat-message.schema';
import { ChatRoom } from './schemas/chat-room.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessage>,

    @InjectModel(ChatRoom.name)
    private readonly roomModel: Model<ChatRoom>,
  ) {}

  async saveMessage(data: {
    senderId: string;
    receiverId: string;
    roomId: string;
    message: string;
  }) {
    return this.messageModel.create({
      senderId: new Types.ObjectId(data.senderId),
      receiverId: new Types.ObjectId(data.receiverId),
      roomId: data.roomId,
      message: data.message,
    });
  }

  async findRoomByParticipants(user1: string, user2: string) {
    return this.roomModel.findOne({
      participants: {
        $all: [
          new Types.ObjectId(user1),
          new Types.ObjectId(user2),
        ],
      },
    });
  }

  async createRoom(participants: string[]) {
    return this.roomModel.create({
      participants: participants.map((p) => new Types.ObjectId(p)),
    });
  }
}