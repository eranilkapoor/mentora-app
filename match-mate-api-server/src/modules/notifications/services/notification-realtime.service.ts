import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { AppLogger } from '@/common/logger/logger.service';

@Injectable()
export class NotificationRealtimeService {
  private server?: Server;

  constructor(private readonly logger: AppLogger) {}

  bindServer(server: Server): void {
    this.server = server;
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    if (!this.server) {
      this.logger.warn('Notification realtime server not ready', {
        event,
        userId,
      });
      return;
    }

    this.server.to(this.getUserRoom(userId)).emit(event, payload);
  }

  getUserRoom(userId: string): string {
    return `notification:user:${userId}`;
  }
}
