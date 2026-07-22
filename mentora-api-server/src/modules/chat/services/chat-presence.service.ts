import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';

const PRESENCE_TTL_SECONDS = 90;
const LAST_SEEN_TTL_SECONDS = 60 * 60 * 24 * 90;
const TYPING_TTL_SECONDS = 10;

@Injectable()
export class ChatPresenceService {
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<string, string>();
  private readonly lastSeen = new Map<string, Date>();

  constructor(@Inject(CACHE_SERVICE) private readonly cache: ICacheService) {}

  async connect(userId: string, socketId: string): Promise<void> {
    const sockets = this.userSockets.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.userSockets.set(userId, sockets);
    this.socketUsers.set(socketId, userId);

    await Promise.all([
      this.cache.set(this.userPresenceKey(userId), true, PRESENCE_TTL_SECONDS),
      this.cache.set(
        this.socketUserKey(socketId),
        userId,
        PRESENCE_TTL_SECONDS,
      ),
      this.cache.del(this.lastSeenKey(userId)),
    ]);
  }

  async disconnect(socketId: string): Promise<string | undefined> {
    const cachedUserId = await this.cache.get<string>(
      this.socketUserKey(socketId),
    );
    const userId = this.socketUsers.get(socketId) ?? cachedUserId ?? undefined;
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
    await this.cache.del(this.socketUserKey(socketId));

    if ((this.userSockets.get(userId)?.size ?? 0) === 0) {
      const lastSeen = new Date();
      this.lastSeen.set(userId, lastSeen);
      await Promise.all([
        this.cache.del(this.userPresenceKey(userId)),
        this.cache.set(
          this.lastSeenKey(userId),
          lastSeen.toISOString(),
          LAST_SEEN_TTL_SECONDS,
        ),
      ]);
    }

    return userId;
  }

  async getUserIdBySocket(socketId: string): Promise<string | undefined> {
    return (
      this.socketUsers.get(socketId) ??
      (await this.cache.get<string>(this.socketUserKey(socketId))) ??
      undefined
    );
  }

  async isOnline(userId: string): Promise<boolean> {
    return (
      (this.userSockets.get(userId)?.size ?? 0) > 0 ||
      (await this.cache.has(this.userPresenceKey(userId)))
    );
  }

  async getLastSeen(userId: string): Promise<Date | null> {
    const localLastSeen = this.lastSeen.get(userId);
    if (localLastSeen) return localLastSeen;

    const cachedLastSeen = await this.cache.get<string>(
      this.lastSeenKey(userId),
    );
    return cachedLastSeen ? new Date(cachedLastSeen) : null;
  }

  async getConnectedCount(userId: string): Promise<number> {
    const localCount = this.userSockets.get(userId)?.size ?? 0;
    if (localCount > 0) return localCount;
    return (await this.cache.has(this.userPresenceKey(userId))) ? 1 : 0;
  }

  async setTyping(
    roomId: string,
    userId: string,
    isTyping: boolean,
  ): Promise<void> {
    const key = this.typingKey(roomId, userId);

    if (!isTyping) {
      await this.cache.del(key);
      return;
    }

    await this.cache.set(key, true, TYPING_TTL_SECONDS);
  }

  async isTyping(roomId: string, userId: string): Promise<boolean> {
    return this.cache.has(this.typingKey(roomId, userId));
  }

  private userPresenceKey(userId: string): string {
    return `presence:user:${userId}`;
  }

  private socketUserKey(socketId: string): string {
    return `presence:socket:${socketId}`;
  }

  private lastSeenKey(userId: string): string {
    return `presence:last-seen:${userId}`;
  }

  private typingKey(roomId: string, userId: string): string {
    return `typing:room:${roomId}:user:${userId}`;
  }
}
