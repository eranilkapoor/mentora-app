import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { AppLogger } from 'src/common/logger/logger.service';

@Injectable()
export class ChatRealtimeService {
  private server?: Server;

  constructor(private readonly logger: AppLogger) {}

  bindServer(server: Server) {
    this.server = server;
  }

  emitToConversation(roomId: string, event: string, payload: unknown) {
    if (!this.server) {
      this.logger.warn('Chat realtime server not ready', { event, roomId });
      return;
    }

    this.server.to(this.getConversationRoom(roomId)).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    if (!this.server) {
      this.logger.warn('Chat realtime server not ready', { event, userId });
      return;
    }

    this.server.to(this.getUserRoom(userId)).emit(event, payload);
  }

  getConversationRoom(roomId: string) {
    return `chat:conversation:${roomId}`;
  }

  getUserRoom(userId: string) {
    return `chat:user:${userId}`;
  }
}
