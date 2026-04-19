import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { AppLogger } from '../logger/logger.service';

export class HybridSocketIoAdapter extends IoAdapter {
  private pubClient?: Redis;
  private subClient?: Redis;
  private redisAdapter?: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const driver = this.configService.get<string>('redis.driver', 'local');

    if (driver !== 'redis') {
      this.logger.log(
        'Socket.IO adapter mode: local (CACHE_DRIVER is not redis)',
      );
      return;
    }

    try {
      const host = this.configService.get<string>('redis.host', 'localhost');
      const port = Number(this.configService.get<number>('redis.port', 6379));
      const db = Number(this.configService.get<number>('redis.db', 0));
      const password =
        this.configService.get<string>('redis.password') || undefined;

      this.pubClient = new Redis({
        host,
        port,
        db,
        password,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      this.subClient = this.pubClient.duplicate();

      await Promise.all([
        this.waitForRedisReady(this.pubClient),
        this.waitForRedisReady(this.subClient),
      ]);

      this.redisAdapter = createAdapter(this.pubClient, this.subClient);
      this.logger.log('Socket.IO adapter mode: redis');
    } catch (error) {
      this.logger.error(
        'Failed to initialize Redis Socket.IO adapter, falling back to local mode',
        error instanceof Error ? error.stack : undefined,
      );

      await this.close();
      this.redisAdapter = undefined;
    }
  }

  createIOServer(port: number, options?: Record<string, unknown>) {
    const server = super.createIOServer(port, options);

    if (this.redisAdapter) {
      server.adapter(this.redisAdapter);
    }

    return server;
  }

  async close(): Promise<void> {
    await Promise.allSettled([
      this.pubClient?.quit(),
      this.subClient?.quit(),
    ]);
    this.pubClient = undefined;
    this.subClient = undefined;
  }

  private async waitForRedisReady(client: Redis): Promise<void> {
    if (client.status === 'ready') {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        client.off('ready', onReady);
        client.off('error', onError);
      };

      client.once('ready', onReady);
      client.once('error', onError);
    });
  }
}