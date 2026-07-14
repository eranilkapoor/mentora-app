/* eslint-disable @typescript-eslint/unbound-method */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { FeatureKey } from '@/common/enums';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { FeatureService } from './feature.service';

const USER_ID = new Types.ObjectId().toString();

const createCache = (): jest.Mocked<ICacheService> =>
  ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    incrementWithExpiry: jest.fn().mockResolvedValue({
      value: 1,
      ttlSeconds: 86_400,
    }),
  }) as unknown as jest.Mocked<ICacheService>;

const createFindChain = (result: unknown) => {
  const chain = {
    populate: jest.fn(),
    select: jest.fn(),
    sort: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn().mockResolvedValue(result),
  };
  chain.populate.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  return chain;
};

const createFixture = () => {
  const cache = createCache();
  const planFeaturesChain = createFindChain([]);
  const subscriptionChain = createFindChain(null);
  const freePlanChain = createFindChain(null);
  const pfModel = { find: jest.fn().mockReturnValue(planFeaturesChain) };
  const subModel = {
    findOne: jest.fn().mockReturnValue(subscriptionChain),
  };
  const planModel = { findOne: jest.fn().mockReturnValue(freePlanChain) };
  const service = new FeatureService(
    pfModel as never,
    subModel as never,
    planModel as never,
    cache,
    {} as never,
  );

  return {
    cache,
    freePlanChain,
    pfModel,
    planFeaturesChain,
    planModel,
    service,
    subModel,
    subscriptionChain,
  };
};

const feature = (
  key: FeatureKey,
  value: unknown,
  type?: 'boolean' | 'limit' | 'quota' | 'tier' | 'duration',
  isActive?: boolean,
) => ({
  _id: new Types.ObjectId(),
  featureId: { key, type, isActive },
  value,
});

describe('FeatureService', () => {
  it('rejects access when no subscription or free plan exists', async () => {
    const { service } = createFixture();

    await expect(
      service.checkAccess(FeatureKey.SEND_INTEREST, { userId: USER_ID }),
    ).rejects.toMatchObject({ code: ErrorCode.SUBSCRIPTION_REQUIRED });
  });

  it('rejects a feature that is absent from the current plan', async () => {
    const { freePlanChain, service } = createFixture();
    freePlanChain.exec.mockResolvedValue({ _id: new Types.ObjectId() });

    await expect(
      service.checkAccess(FeatureKey.SEND_INTEREST, { userId: USER_ID }),
    ).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE,
    });
  });

  it.each([
    ['limit', 3, true],
    ['quota', 3, true],
    ['duration', 3, true],
    ['boolean', true, false],
    [undefined, 3, true],
    ['limit', -1, false],
    ['limit', '3', false],
  ] as const)(
    'handles %s feature value %s with usage check=%s',
    async (type, value, shouldCheckUsage) => {
      const { cache, freePlanChain, planFeaturesChain, service } =
        createFixture();
      freePlanChain.exec.mockResolvedValue({ _id: new Types.ObjectId() });
      planFeaturesChain.exec.mockResolvedValue([
        feature(FeatureKey.SEND_INTEREST, value, type),
      ]);
      await expect(
        service.checkAccess(FeatureKey.SEND_INTEREST, { userId: USER_ID }),
      ).resolves.toEqual({ allowed: true });

      expect(cache.incrementWithExpiry).toHaveBeenCalledTimes(
        shouldCheckUsage ? 1 : 0,
      );
    },
  );

  it.each([null, undefined, 1])(
    'increments available usage when the current value is %s',
    async (current) => {
      const { cache, service } = createFixture();
      cache.incrementWithExpiry.mockResolvedValue({
        value: (current ?? 0) + 1,
        ttlSeconds: 86_400,
      });

      await service.checkUsageLimit(USER_ID, FeatureKey.SEND_INTEREST, 3);

      expect(cache.incrementWithExpiry).toHaveBeenCalledWith(
        expect.stringContaining(`usage:${USER_ID}:`),
        86_400,
      );
    },
  );

  it('rejects usage once the plan limit is reached', async () => {
    const { cache, service } = createFixture();
    cache.incrementWithExpiry.mockResolvedValue({
      value: 4,
      ttlSeconds: 86_400,
    });

    await expect(
      service.checkUsageLimit(USER_ID, FeatureKey.SEND_INTEREST, 3),
    ).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE,
    });
    expect(cache.incrementWithExpiry).toHaveBeenCalledTimes(1);
  });

  it.each([
    [8, 0],
    [2, 3],
    [null, 5],
    [undefined, 5],
  ])('calculates remaining usage for %s', async (current, expected) => {
    const { cache, service } = createFixture();
    cache.get.mockResolvedValue(current);

    await expect(
      service.getRemainingUsage(USER_ID, FeatureKey.SEND_INTEREST, 5),
    ).resolves.toBe(expected);
  });

  it('returns an empty feature map when no plan is available', async () => {
    const { service } = createFixture();

    await expect(service.getFeaturesForUser(USER_ID)).resolves.toEqual({});
  });

  it('maps plan feature values and defaults nullish values to true', async () => {
    const { freePlanChain, planFeaturesChain, service } = createFixture();
    freePlanChain.exec.mockResolvedValue({ _id: new Types.ObjectId() });
    planFeaturesChain.exec.mockResolvedValue([
      feature(FeatureKey.SEND_INTEREST, 5, 'limit'),
      feature(FeatureKey.VIDEO_PROFILE, null, 'boolean'),
    ]);

    await expect(service.getFeaturesForUser(USER_ID)).resolves.toEqual({
      [FeatureKey.SEND_INTEREST]: 5,
      [FeatureKey.VIDEO_PROFILE]: true,
    });
  });

  it('evaluates feature-map values as booleans', () => {
    const { service } = createFixture();

    expect(
      service.hasFeature(
        { [FeatureKey.SEND_INTEREST]: 1 },
        FeatureKey.SEND_INTEREST,
      ),
    ).toBe(true);
    expect(service.hasFeature({}, FeatureKey.SEND_INTEREST)).toBe(false);
  });

  it('uses cached plan features without querying MongoDB', async () => {
    const { cache, freePlanChain, pfModel, service } = createFixture();
    freePlanChain.exec.mockResolvedValue({ _id: new Types.ObjectId() });
    cache.get.mockResolvedValue([
      feature(FeatureKey.SEND_INTEREST, true, 'boolean'),
    ]);

    await expect(
      service.checkAccess(FeatureKey.SEND_INTEREST, { userId: USER_ID }),
    ).resolves.toEqual({ allowed: true });
    expect(pfModel.find).not.toHaveBeenCalled();
  });

  it('filters inactive plan features and caches active rows', async () => {
    const { cache, freePlanChain, planFeaturesChain, service } =
      createFixture();
    const planId = new Types.ObjectId();
    const active = feature(FeatureKey.SEND_INTEREST, true, 'boolean', true);
    const unspecified = feature(FeatureKey.VIDEO_PROFILE, true, 'boolean');
    const inactive = feature(FeatureKey.PROFILE_BOOST, true, 'boolean', false);
    const malformed = { _id: new Types.ObjectId(), featureId: undefined };
    freePlanChain.exec.mockResolvedValue({ _id: planId });
    planFeaturesChain.exec.mockResolvedValue([
      active,
      unspecified,
      inactive,
      malformed,
    ]);

    const result = await service.getFeaturesForUser(USER_ID);

    expect(result).toEqual({
      [FeatureKey.SEND_INTEREST]: true,
      [FeatureKey.VIDEO_PROFILE]: true,
    });
    expect(cache.set).toHaveBeenCalledWith(
      `plan_features:${planId.toString()}`,
      [active, unspecified],
      300,
    );
  });

  it('invalidates cached plan features', async () => {
    const { cache, service } = createFixture();

    await service.invalidatePlanFeaturesCache('plan-id');

    expect(cache.del).toHaveBeenCalledWith('plan_features:plan-id');
  });

  it('prefers an active subscription plan over the free-plan fallback', async () => {
    const { planModel, service, subscriptionChain } = createFixture();
    const planId = new Types.ObjectId();
    subscriptionChain.exec.mockResolvedValue({ planId });

    await service.getFeaturesForUser(USER_ID);

    expect(planModel.findOne).not.toHaveBeenCalled();
  });
});
