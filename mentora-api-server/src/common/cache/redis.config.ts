import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const buildRedisOptions = (
  configService: ConfigService,
): RedisOptions => ({
  host: configService.get<string>('redis.host', 'localhost'),
  port: configService.get<number>('redis.port', 6379),
  db: configService.get<number>('redis.db', 0),
  password: configService.get<string>('redis.password') || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number): number => Math.min(times * 50, 2_000),
});

export const isRedisDriver = (configService: ConfigService): boolean =>
  configService.get<string>('redis.driver', 'local') === 'redis';
