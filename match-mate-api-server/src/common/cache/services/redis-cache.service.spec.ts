/* eslint-disable @typescript-eslint/unbound-method */
import type Redis from 'ioredis';
import { AppLogger } from '@/common/logger/logger.service';
import { RedisCacheService } from './redis-cache.service';

describe('RedisCacheService', () => {
  const client = {
    quit: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    flushdb: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    scan: jest.fn(),
    eval: jest.fn(),
  };
  const logger = { log: jest.fn() } as unknown as AppLogger;
  let service: RedisCacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RedisCacheService(client as unknown as Redis, logger);
  });

  it('initializes and closes the Redis client', async () => {
    service.onModuleInit();
    await service.onModuleDestroy();

    expect(logger.log).toHaveBeenCalledWith('RedisCacheService initialised');
    expect(client.quit).toHaveBeenCalledTimes(1);
  });

  it('sets values with and without expiry and reads serialized data', async () => {
    await service.set('permanent', { id: 1 });
    await service.set('temporary', ['value'], 30);

    expect(client.set).toHaveBeenNthCalledWith(
      1,
      'permanent',
      JSON.stringify({ id: 1 }),
    );
    expect(client.set).toHaveBeenNthCalledWith(
      2,
      'temporary',
      JSON.stringify(['value']),
      'EX',
      30,
    );

    client.get.mockResolvedValueOnce(JSON.stringify({ id: 2 }));
    await expect(service.get('present')).resolves.toEqual({ id: 2 });
    client.get.mockResolvedValueOnce(null);
    await expect(service.get('missing')).resolves.toBeNull();
  });

  it('deletes direct keys and scanned pattern matches', async () => {
    await service.del('one');
    expect(client.del).toHaveBeenCalledWith('one');

    client.scan
      .mockResolvedValueOnce(['7', ['user:1']])
      .mockResolvedValueOnce(['0', ['user:2']]);
    await service.delByPattern('user:*');

    expect(client.scan).toHaveBeenNthCalledWith(
      1,
      '0',
      'MATCH',
      'user:*',
      'COUNT',
      100,
    );
    expect(client.scan).toHaveBeenNthCalledWith(
      2,
      '7',
      'MATCH',
      'user:*',
      'COUNT',
      100,
    );
    expect(client.del).toHaveBeenLastCalledWith('user:1', 'user:2');

    client.del.mockClear();
    client.scan.mockResolvedValueOnce(['0', []]);
    await service.delByPattern('missing:*');
    expect(client.del).not.toHaveBeenCalled();
  });

  it('delegates existence, flush, increment and expiry operations', async () => {
    client.exists.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    await expect(service.has('present')).resolves.toBe(true);
    await expect(service.has('missing')).resolves.toBe(false);

    client.incr.mockResolvedValue(4);
    await expect(service.incr('counter')).resolves.toBe(4);
    await service.expire('counter', 10);
    await service.flush();

    expect(client.expire).toHaveBeenCalledWith('counter', 10);
    expect(client.flushdb).toHaveBeenCalledTimes(1);
  });

  it('supports atomic set-if-absent and compare-and-delete operations', async () => {
    client.set.mockResolvedValueOnce('OK').mockResolvedValueOnce(null);
    await expect(service.setIfAbsent('lock', { id: 1 }, 30)).resolves.toBe(
      true,
    );
    await expect(service.setIfAbsent('lock', { id: 1 }, 30)).resolves.toBe(
      false,
    );
    expect(client.set).toHaveBeenCalledWith(
      'lock',
      JSON.stringify({ id: 1 }),
      'EX',
      30,
      'NX',
    );

    client.eval.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    await expect(
      service.consumeIfValueMatches('challenge', 'value'),
    ).resolves.toBe(true);
    await expect(
      service.consumeIfValueMatches('challenge', 'value'),
    ).resolves.toBe(false);
    expect(client.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('GET', KEYS[1])"),
      1,
      'challenge',
      JSON.stringify('value'),
    );
  });
});
