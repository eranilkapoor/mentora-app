import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(private readonly repo: ChatRepository) {}

  async sendMessage(
    senderId: string,
    payload: {
      receiverId: string;
      roomId: string;
      message: string;
      createdAt?: Date;
    },
  ) {
    return this.repo.saveMessage({
      senderId,
      receiverId: payload.receiverId,
      roomId: payload.roomId,
      message: payload.message
    });
  }
}