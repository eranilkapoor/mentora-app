import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  CACHE_SERVICE,
  REDIS_CLIENT,
  REDIS_PUB_CLIENT,
  REDIS_SUB_CLIENT,
} from './cache.constants';
import { RedisCacheService } from './services/redis-cache.service';
import { LocalCacheService } from './services/local-cache.service';
import { buildRedisOptions, isRedisDriver } from './redis.config';
import { AppLogger } from '@/common/logger/logger.service';

// ─── Shared factory ──────────────────────────────────────────────────────────
// Creates a named Redis client with lifecycle logs.
// Returns null when driver !== 'redis' so adapters degrade gracefully.

const makeRedisClient = (
  name: string,
  configService: ConfigService,
  logger: AppLogger,
): Redis | null => {
  if (!isRedisDriver(configService)) return null;

  const client = new Redis(buildRedisOptions(configService));

  client.on('connect', () => logger.log(`Redis [${name}] connected`));
  client.on('ready', () => logger.log(`Redis [${name}] ready`));
  client.on('error', (err: Error) =>
    logger.error(`Redis [${name}] error`, err.stack),
  );
  client.on('close', () => logger.warn(`Redis [${name}] connection closed`));
  client.on('reconnecting', () =>
    logger.warn(`Redis [${name}] reconnecting...`),
  );

  return client;
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // ── Main client — used by RedisCacheService ────────────────────────────
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService, AppLogger],
      useFactory: (
        configService: ConfigService,
        logger: AppLogger,
      ): Redis | null => makeRedisClient('MAIN', configService, logger),
    },

    // ── Pub client — used by Socket.IO adapter ─────────────────────────────
    {
      provide: REDIS_PUB_CLIENT,
      inject: [ConfigService, AppLogger],
      useFactory: (
        configService: ConfigService,
        logger: AppLogger,
      ): Redis | null => makeRedisClient('PUB', configService, logger),
    },

    // ── Sub client — always a duplicate of pub ─────────────────────────────
    // Redis pub/sub requires separate connections but they share the same
    // config. duplicate() copies all options without an extra new Redis() call.
    {
      provide: REDIS_SUB_CLIENT,
      inject: [REDIS_PUB_CLIENT, AppLogger],
      useFactory: (
        pubClient: Redis | null,
        logger: AppLogger,
      ): Redis | null => {
        if (!pubClient) return null;
        const sub = pubClient.duplicate();
        sub.on('connect', () => logger.log('Redis [SUB] connected'));
        sub.on('ready', () => logger.log('Redis [SUB] ready'));
        sub.on('error', (err: Error) =>
          logger.error('Redis [SUB] error', err.stack),
        );
        return sub;
      },
    },

    // ── Cache service — picks impl based on driver ─────────────────────────
    {
      provide: CACHE_SERVICE,
      inject: [ConfigService, AppLogger, REDIS_CLIENT],
      useFactory: (
        configService: ConfigService,
        logger: AppLogger,
        redisClient: Redis | null,
      ) => {
        if (isRedisDriver(configService) && redisClient) {
          return new RedisCacheService(redisClient, logger);
        }
        return new LocalCacheService(logger);
      },
    },
  ],
  exports: [CACHE_SERVICE, REDIS_CLIENT, REDIS_PUB_CLIENT, REDIS_SUB_CLIENT],
})
export class CacheModule {}
