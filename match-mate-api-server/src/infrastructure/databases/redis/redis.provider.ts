import Redis from 'ioredis';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const REDIS = 'REDIS';

export const RedisProvider: Provider = {
  provide: REDIS,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    const host = configService.get<string>('redis.host', 'localhost');
    const port = configService.get<number>('redis.port', 6379);
    const password = configService.get<string>('redis.password');
    const db = configService.get<number>('redis.db', 0);

    const client = new Redis({
      host,
      port,
      password,
      db,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    return client;
  },
};
