import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatPresenceService {
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<string, string>();
  private readonly lastSeen = new Map<string, Date>();

  connect(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.userSockets.set(userId, sockets);
    this.socketUsers.set(socketId, userId);
  }

  disconnect(socketId: string) {
    const userId = this.socketUsers.get(socketId);
    if (!userId) {
      return undefined;
    }

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
        this.lastSeen.set(userId, new Date());
      }
    }

    this.socketUsers.delete(socketId);
    return userId;
  }

  getUserIdBySocket(socketId: string) {
    return this.socketUsers.get(socketId);
  }

  isOnline(userId: string) {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  getLastSeen(userId: string) {
    return this.lastSeen.get(userId) ?? null;
  }

  getConnectedCount(userId: string) {
    return this.userSockets.get(userId)?.size ?? 0;
  }
}
