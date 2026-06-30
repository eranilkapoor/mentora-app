import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, ServerOptions } from 'socket.io';
import { AppLogger } from '@/common/logger/logger.service';
import { isRedisDriver } from '@/common/cache/redis.config';

export class HybridSocketIoAdapter extends IoAdapter {
  private redisAdapter?: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly pubClient: Redis | null,
    private readonly subClient: Redis | null,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    super(app);
  }

  async connect(): Promise<void> {
    if (!isRedisDriver(this.configService)) {
      this.logger.log('Socket.IO adapter mode: local');
      return;
    }

    if (!this.pubClient || !this.subClient) {
      this.logger.warn(
        'Socket.IO: Redis clients unavailable, falling back to local mode',
      );
      return;
    }

    try {
      await Promise.all([
        this.waitForReady(this.pubClient),
        this.waitForReady(this.subClient),
      ]);

      this.redisAdapter = createAdapter(this.pubClient, this.subClient);
      this.logger.log('Socket.IO adapter mode: redis');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        'Socket.IO Redis adapter failed, falling back to local mode',
        err.stack,
      );
      this.redisAdapter = undefined;
    }
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    if (!server || typeof server !== 'object') {
      throw new Error('Failed to create Socket.IO server');
    }
    if (this.redisAdapter) {
      server.adapter(this.redisAdapter);
    }
    return server;
  }

  // Graceful shutdown — called by NestJS lifecycle hook
  async close(): Promise<void> {
    await Promise.allSettled([this.pubClient?.quit(), this.subClient?.quit()]);
    this.logger.log('Socket.IO Redis pub/sub clients closed');
  }

  private waitForReady(client: Redis): Promise<void> {
    if (client.status === 'ready') {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const onReady = (): void => {
        cleanup();
        resolve();
      };
      const onError = (err: Error): void => {
        cleanup();
        reject(err);
      };
      const cleanup = (): void => {
        client.off('ready', onReady);
        client.off('error', onError);
      };
      client.once('ready', onReady);
      client.once('error', onError);
    });
  }

  get isRedisConnected(): boolean {
    return (
      this.pubClient?.status === 'ready' && this.subClient?.status === 'ready'
    );
  }
}
