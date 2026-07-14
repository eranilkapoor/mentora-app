import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheService } from '../interfaces/cache.interface';
import { AppLogger } from '@/common/logger/logger.service';

@Injectable()
export class RedisCacheService
  implements ICacheService, OnModuleInit, OnModuleDestroy
{
  constructor(
    // Injected directly — not via @Inject token
    // because CacheModule.useFactory passes the instance explicitly
    private readonly client: Redis,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.logger.log('RedisCacheService initialised');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, data, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, data);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    // SCAN instead of KEYS — non-blocking in production
    const keys = await this.scanKeys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async incrementWithExpiry(
    key: string,
    ttlSeconds: number,
  ): Promise<{ value: number; ttlSeconds: number }> {
    const script = `
      local value = redis.call('INCR', KEYS[1])
      if value == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
      local ttl = redis.call('TTL', KEYS[1])
      return {value, ttl}
    `;
    const result = (await this.client.eval(
      script,
      1,
      key,
      String(ttlSeconds),
    )) as [number, number];
    return { value: Number(result[0]), ttlSeconds: Number(result[1]) };
  }

  async setIfAbsent<T>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(
      key,
      JSON.stringify(value),
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  async consumeIfValueMatches<T>(key: string, expected: T): Promise<boolean> {
    const script = `
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        redis.call('DEL', KEYS[1])
        return 1
      end
      return 0
    `;
    const result = await this.client.eval(
      script,
      1,
      key,
      JSON.stringify(expected),
    );
    return Number(result) === 1;
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [next, batch] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = next;
      keys.push(...batch);
    } while (cursor !== '0');
    return keys;
  }
}
