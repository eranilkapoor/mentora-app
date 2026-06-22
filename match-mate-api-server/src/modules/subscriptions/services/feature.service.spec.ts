import { FeatureKey } from '@/common/enums';
import { ErrorCode } from '@/common/constants';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { FeatureService } from './feature.service';

const createCache = (): jest.Mocked<ICacheService> =>
  ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  }) as unknown as jest.Mocked<ICacheService>;

const createService = (cache: ICacheService): FeatureService =>
  new FeatureService({} as never, {} as never, {} as never, cache, {} as never);

describe('FeatureService usage limits', () => {
  it('increments usage and applies the daily expiry', async () => {
    const cache = createCache();
    cache.get.mockResolvedValue(1);
    const service = createService(cache);

    await service.checkUsageLimit('user-id', FeatureKey.SEND_INTEREST, 3);

    expect(cache.incr.mock.calls).toHaveLength(1);
    expect(cache.expire.mock.calls).toContainEqual([
      expect.stringContaining('usage:user-id:'),
      86_400,
    ]);
  });

  it('rejects usage once the plan limit is reached', async () => {
    const cache = createCache();
    cache.get.mockResolvedValue(3);
    const service = createService(cache);

    await expect(
      service.checkUsageLimit('user-id', FeatureKey.SEND_INTEREST, 3),
    ).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE,
    });
    expect(cache.incr.mock.calls).toHaveLength(0);
  });

  it('never reports a negative remaining quota', async () => {
    const cache = createCache();
    cache.get.mockResolvedValue(8);
    const service = createService(cache);

    await expect(
      service.getRemainingUsage('user-id', FeatureKey.SEND_INTEREST, 5),
    ).resolves.toBe(0);
  });
});
