import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/common/logger/logger.service';

const redisMock = {
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(1),
  keys: jest.fn(),
  exists: jest.fn(),
  flushdb: jest.fn().mockResolvedValue('OK'),
  incr: jest.fn().mockResolvedValue(2),
  expire: jest.fn().mockResolvedValue(1),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => redisMock);
});

import { RedisCacheService } from './redis-cache.service';

describe('RedisCacheService', () => {
  let service: RedisCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => fallback ?? key),
          },
        },
        { provide: AppLogger, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  afterEach(() => jest.clearAllMocks());

  it('set/get should serialize and deserialize values', async () => {
    redisMock.get.mockResolvedValue(JSON.stringify({ ok: true }));

    await service.set('k1', { ok: true }, 10);
    const value = await service.get<{ ok: boolean }>('k1');

    expect(redisMock.set).toHaveBeenCalledWith('k1', JSON.stringify({ ok: true }), 'EX', 10);
    expect(value).toEqual({ ok: true });
  });

  it('delByPattern should delete matched keys', async () => {
    redisMock.keys.mockResolvedValue(['a', 'b']);

    await service.delByPattern('a*');

    expect(redisMock.keys).toHaveBeenCalledWith('a*');
    expect(redisMock.del).toHaveBeenCalledWith('a', 'b');
  });

  it('has should return boolean from exists', async () => {
    redisMock.exists.mockResolvedValue(1);
    await expect(service.has('k')).resolves.toBe(true);

    redisMock.exists.mockResolvedValue(0);
    await expect(service.has('k')).resolves.toBe(false);
  });

  it('onModuleInit and onModuleDestroy should wire lifecycle', async () => {
    service.onModuleInit();
    expect(redisMock.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(redisMock.on).toHaveBeenCalledWith('error', expect.any(Function));

    await service.onModuleDestroy();
    expect(redisMock.quit).toHaveBeenCalled();
  });
});
