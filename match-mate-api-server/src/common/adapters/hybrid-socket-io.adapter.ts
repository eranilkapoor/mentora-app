import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis, { RedisOptions } from 'ioredis';
import { Server, ServerOptions } from 'socket.io';
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

  // ==========================================
  //  CONNECT TO REDIS (WITH FALLBACK)
  // ==========================================
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
        this.configService.get<string>('redis.password') ?? undefined;

      const redisOptions: RedisOptions = {
        host,
        port,
        db,
        password,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,

        //  Retry strategy
        retryStrategy: (times: number): number => {
          const delay = Math.min(times * 50, 2000);
          this.logger.warn(`Redis retry attempt #${times}, delay ${delay}ms`);
          return delay;
        },
      };

      this.pubClient = new Redis(redisOptions);
      this.subClient = this.pubClient.duplicate();

      //  Attach lifecycle logs
      this.attachRedisEvents(this.pubClient, 'PUB');
      this.attachRedisEvents(this.subClient, 'SUB');

      await Promise.all([
        this.waitForRedisReady(this.pubClient),
        this.waitForRedisReady(this.subClient),
      ]);

      this.redisAdapter = createAdapter(this.pubClient, this.subClient);

      this.logger.log(' Socket.IO adapter mode: redis');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        ' Redis adapter failed, falling back to local mode',
        err.stack,
      );

      await this.close();
      this.redisAdapter = undefined;
    }
  }

  // ==========================================
  //  CREATE SOCKET SERVER
  // ==========================================
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

  // ==========================================
  //  CLEANUP
  // ==========================================
  async close(): Promise<void> {
    await Promise.allSettled([this.pubClient?.quit(), this.subClient?.quit()]);

    this.pubClient = undefined;
    this.subClient = undefined;

    this.logger.log(' Redis connections closed');
  }

  // ==========================================
  //  WAIT UNTIL REDIS IS READY
  // ==========================================
  private async waitForRedisReady(client: Redis): Promise<void> {
    if (client.status === 'ready') return;

    await new Promise<void>((resolve, reject) => {
      const onReady = (): void => {
        cleanup();
        resolve();
      };

      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };

      const cleanup = (): void => {
        client.off('ready', onReady);
        client.off('error', onError);
      };

      client.once('ready', onReady);
      client.once('error', onError);
    });
  }

  // ==========================================
  //  REDIS EVENT LOGGING
  // ==========================================
  private attachRedisEvents(client: Redis, label: string): void {
    client.on('connect', () => {
      this.logger.log(` Redis ${label} connected`);
    });

    client.on('ready', () => {
      this.logger.log(` Redis ${label} ready`);
    });

    client.on('error', (err: Error) => {
      this.logger.error(` Redis ${label} error`, err.stack);
    });

    client.on('close', () => {
      this.logger.warn(` Redis ${label} connection closed`);
    });

    client.on('reconnecting', () => {
      this.logger.warn(` Redis ${label} reconnecting...`);
    });
  }

  // ==========================================
  //  HEALTH CHECK
  // ==========================================
  get isRedisConnected(): boolean {
    return this.pubClient?.status === 'ready';
  }
}
