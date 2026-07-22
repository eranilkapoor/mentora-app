/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import * as fs from 'fs';
import { AppLogger } from '@/common/logger/logger.service';
import { LocalCacheService } from './local-cache.service';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('LocalCacheService', () => {
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as unknown as AppLogger;
  const existsSync = fs.existsSync as jest.Mock;
  const readFileSync = fs.readFileSync as jest.Mock;
  const writeFileSync = fs.writeFileSync as jest.Mock;
  let now: jest.SpyInstance<number, []>;
  let service: LocalCacheService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    existsSync.mockReturnValue(false);
    service = new LocalCacheService(logger);
  });

  afterEach(() => {
    service.onModuleDestroy();
    now.mockRestore();
    jest.useRealTimers();
  });

  it('supports set, get, has, increment, deletion and flush', async () => {
    await service.set('plain', { id: 1 });
    expect(await service.get('plain')).toEqual({ id: 1 });
    expect(await service.has('plain')).toBe(true);
    expect(await service.has('missing')).toBe(false);

    expect(await service.incr('counter')).toBe(1);
    expect(await service.incr('counter')).toBe(2);

    await service.del('plain');
    expect(await service.get('plain')).toBeNull();
    await service.flush();
    expect(await service.get('counter')).toBeNull();
  });

  it('supports atomic-style set-if-absent and compare-and-delete locally', async () => {
    await expect(service.setIfAbsent('lock', { id: 1 }, 30)).resolves.toBe(
      true,
    );
    await expect(service.setIfAbsent('lock', { id: 2 }, 30)).resolves.toBe(
      false,
    );
    await expect(
      service.consumeIfValueMatches('lock', { id: 2 }),
    ).resolves.toBe(false);
    await expect(
      service.consumeIfValueMatches('lock', { id: 1 }),
    ).resolves.toBe(true);
    await expect(service.get('lock')).resolves.toBeNull();
  });

  it('expires keys using a relative TTL and removes expired reads', async () => {
    await service.set('temporary', 'value', 2);
    now.mockReturnValue(1_001_000);
    expect(await service.get('temporary')).toBe('value');
    now.mockReturnValue(1_003_000);
    expect(await service.get('temporary')).toBeNull();

    await service.set('renewed', 'value');
    now.mockReturnValue(2_000_000);
    await service.expire('renewed', 5);
    now.mockReturnValue(2_004_999);
    expect(await service.get('renewed')).toBe('value');
    now.mockReturnValue(2_005_001);
    expect(await service.get('renewed')).toBeNull();

    await service.expire('missing', 5);
  });

  it('deletes wildcard and single-character key patterns', async () => {
    await service.set('user:1', 1);
    await service.set('user:2', 2);
    await service.set('team:1', 3);

    await service.delByPattern('user:?');
    expect(await service.get('user:1')).toBeNull();
    expect(await service.get('user:2')).toBeNull();
    expect(await service.get('team:1')).toBe(3);

    await service.delByPattern('team:*');
    expect(await service.get('team:1')).toBeNull();
  });

  it('loads valid unexpired disk entries and skips expired entries', async () => {
    service.onModuleDestroy();
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(
      JSON.stringify({
        permanent: { value: 'saved', expiresAt: null },
        live: { value: 'live', expiresAt: 1_000_001 },
        expired: { value: 'old', expiresAt: 999_999 },
      }),
    );

    service = new LocalCacheService(logger);

    expect(await service.get('permanent')).toBe('saved');
    expect(await service.get('live')).toBe('live');
    expect(await service.get('expired')).toBeNull();
    expect(logger.log).toHaveBeenCalledWith('Loaded 2 entries from disk cache');
  });

  it('starts fresh when persisted cache cannot be parsed', () => {
    service.onModuleDestroy();
    existsSync.mockReturnValue(true);
    readFileSync.mockImplementation(() => {
      throw new Error('invalid cache');
    });

    service = new LocalCacheService(logger);

    expect(logger.warn).toHaveBeenCalledWith(
      'Could not load cache from disk, starting fresh',
    );
  });

  it('logs persistence failures and omits expired entries from disk', async () => {
    await service.set('live', 'value');
    await service.set('expired', 'value', 1);
    now.mockReturnValue(1_002_000);
    await service.set('trigger', 'write');

    const persisted = JSON.parse(
      writeFileSync.mock.calls.at(-1)?.[1] as string,
    ) as Record<string, unknown>;
    expect(persisted).toHaveProperty('live');
    expect(persisted).not.toHaveProperty('expired');

    writeFileSync.mockImplementationOnce(() => {
      throw new Error('disk full');
    });
    await service.set('failure', true);
    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to persist cache to disk:',
      expect.any(Error),
    );
  });

  it('periodically cleans expired entries and stays quiet when none expire', async () => {
    await service.set('expired', 'value', 1);
    await service.set('future', 'value', 10);
    await service.set('permanent', 'value');
    now.mockReturnValue(1_002_000);
    jest.advanceTimersByTime(60_000);
    expect(logger.debug).toHaveBeenCalledWith(
      'Cleaned 1 expired cache entries',
    );

    jest.clearAllMocks();
    (service as unknown as { cleanup(): void }).cleanup();
    expect(logger.debug).not.toHaveBeenCalled();
  });
});
