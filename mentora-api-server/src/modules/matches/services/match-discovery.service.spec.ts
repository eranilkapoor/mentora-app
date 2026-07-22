/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Gender } from '@/common/enums';
import { MatchDiscoveryService } from './match-discovery.service';

describe('MatchDiscoveryService', () => {
  const repo = {
    getProfile: jest.fn(),
    getPreference: jest.fn(),
    getInteractedUserIds: jest.fn(),
    findProfiles: jest.fn(),
    findNearbyProfiles: jest.fn(),
    getActiveMediaByUserIds: jest.fn(),
    getPreferencesByUserIds: jest.fn(),
    getVerifiedUserIds: jest.fn(),
  };
  const settingsService = {
    getUnavailableRelationUserIds: jest.fn(),
  };
  const profileBoostService = {
    getActiveBoostMap: jest.fn(),
  };
  const compatibilityService = {
    calculateMutualCompatibility: jest.fn(),
  };

  let service: MatchDiscoveryService;
  let userId: string;
  let firstId: string;
  let secondId: string;
  let myProfile: Record<string, unknown>;

  const profile = (id: string, score = 50) => ({
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(id),
    profileScore: score,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new Types.ObjectId().toString();
    firstId = new Types.ObjectId().toString();
    secondId = new Types.ObjectId().toString();
    myProfile = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      age: 30,
      personal: { gender: Gender.MALE, religion: 'hindu' },
      location: { type: 'Point', coordinates: [73.8, 18.5] },
    };
    repo.getProfile.mockResolvedValue(myProfile);
    repo.getPreference.mockResolvedValue(null);
    repo.getInteractedUserIds.mockResolvedValue([new Types.ObjectId(firstId)]);
    settingsService.getUnavailableRelationUserIds.mockResolvedValue([firstId]);
    repo.findProfiles.mockResolvedValue({ profiles: [], total: 0 });
    repo.findNearbyProfiles.mockResolvedValue({ profiles: [], total: 0 });
    repo.getActiveMediaByUserIds.mockResolvedValue([]);
    repo.getPreferencesByUserIds.mockResolvedValue([]);
    repo.getVerifiedUserIds.mockResolvedValue([new Types.ObjectId(secondId)]);
    profileBoostService.getActiveBoostMap.mockResolvedValue(new Map());
    compatibilityService.calculateMutualCompatibility.mockReturnValue({
      score: 70,
    });
    service = new MatchDiscoveryService(
      repo as never,
      settingsService as never,
      profileBoostService as never,
      compatibilityService as never,
    );
  });

  it('requires an active member profile for discovery', async () => {
    repo.getProfile.mockResolvedValue(null);
    await expect(
      service.getRecommendedMatches(userId, {}),
    ).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
  });

  it('scores, boosts, sorts, verifies, and paginates recommendations', async () => {
    const preference = {
      settings: { isStrict: true, minimumMatchScore: 60 },
      filters: {
        age: { min: 24, max: 34 },
        height: { min: 155, max: 180 },
        religion: ['hindu'],
        caste: ['caste'],
        subCaste: ['sub'],
        maritalStatus: ['never_married'],
        city: ['Pune'],
        qualification: ['graduate'],
        occupationType: ['private'],
        bodyType: ['average'],
        smoking: ['never'],
        drinking: ['never'],
        eating: ['vegetarian'],
      },
    };
    repo.getPreference.mockResolvedValue(preference);
    repo.findProfiles.mockResolvedValue({
      profiles: [profile(firstId, 40), profile(secondId, 80)],
      total: 3,
    });
    repo.getActiveMediaByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(firstId), url: 'one' },
      { userId: new Types.ObjectId(firstId), url: 'two' },
    ]);
    repo.getPreferencesByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(firstId), filters: {} },
    ]);
    compatibilityService.calculateMutualCompatibility
      .mockReturnValueOnce({ score: 40 })
      .mockReturnValueOnce({ score: 80 });
    profileBoostService.getActiveBoostMap.mockResolvedValue(
      new Map([[firstId, { multiplier: 2, endsAt: new Date('2027-01-01') }]]),
    );

    await expect(
      service.getRecommendedMatches(userId, {
        page: 2,
        limit: 2,
        search: 'Asha.',
        minAge: 25,
        maxAge: 35,
        minHeight: 150,
        maxHeight: 185,
        city: ' Pune ',
        state: ' Maharashtra ',
        religion: 'hindu',
        caste: 'caste',
        qualification: 'graduate',
        occupationType: 'private',
        verifiedOnly: true,
      } as never),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({ userId: new Types.ObjectId(firstId) }),
        expect.objectContaining({ userId: new Types.ObjectId(secondId) }),
      ],
      meta: {
        total: 3,
        page: 2,
        limit: 2,
        totalPages: 2,
        hasNextPage: false,
        hasPrevPage: true,
      },
    });
    expect(repo.getVerifiedUserIds).toHaveBeenCalled();
  });

  it('returns new matches and falls back when the recent window is empty', async () => {
    const first = profile(firstId);
    repo.findProfiles.mockResolvedValueOnce({ profiles: [first], total: 1 });
    await expect(service.getNewMatches(userId, {})).resolves.toMatchObject({
      data: [expect.objectContaining({ images: [] })],
      meta: expect.objectContaining({ total: 1 }),
    });

    repo.findProfiles
      .mockResolvedValueOnce({ profiles: [], total: 0 })
      .mockResolvedValueOnce({ profiles: [first], total: 1 });
    await expect(
      service.getNewMatches(userId, { page: 1, limit: 10 }),
    ).resolves.toMatchObject({
      data: [expect.objectContaining({ userId: first.userId })],
    });
  });

  it('requires location and supports default and explicit nearby radii', async () => {
    repo.getProfile.mockResolvedValue({ ...myProfile, location: undefined });
    await expect(service.getNearbyMatches(userId, {})).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });

    repo.getProfile.mockResolvedValue(myProfile);
    repo.findNearbyProfiles.mockResolvedValue({
      profiles: [profile(firstId)],
      total: 1,
    });
    await service.getNearbyMatches(userId, {});
    expect(repo.findNearbyProfiles).toHaveBeenLastCalledWith(
      expect.any(Object),
      [73.8, 18.5],
      100000,
      0,
      20,
    );
    await service.getNearbyMatches(userId, { radiusKm: 25 });
    expect(repo.findNearbyProfiles).toHaveBeenLastCalledWith(
      expect.any(Object),
      [73.8, 18.5],
      25000,
      0,
      20,
    );
  });

  it('returns online matches with images and boosts', async () => {
    repo.findProfiles.mockResolvedValue({
      profiles: [profile(firstId)],
      total: 1,
    });
    await expect(service.getOnlineMatches(userId, {})).resolves.toMatchObject({
      data: [expect.objectContaining({ images: [] })],
    });

    repo.findProfiles.mockResolvedValue({
      profiles: [profile(firstId, 20), profile(secondId, 80)],
      total: 2,
    });
    await expect(
      service.getRecommendedMatches(userId, {}),
    ).resolves.toMatchObject({
      data: [
        expect.objectContaining({ userId: new Types.ObjectId(firstId) }),
        expect.objectContaining({ userId: new Types.ObjectId(secondId) }),
      ],
      meta: expect.objectContaining({ page: 1 }),
    });
  });

  it('builds base and strict preference filters across all alternatives', () => {
    const privateService = service as any;
    const interacted = [new Types.ObjectId(firstId)];
    expect(
      privateService.buildBaseFilter(userId, undefined, interacted).$and,
    ).toHaveLength(1);
    expect(privateService.getOppositeGender(Gender.MALE)).toBe(Gender.FEMALE);
    expect(privateService.getOppositeGender(Gender.FEMALE)).toBe(Gender.MALE);
    expect(privateService.getOppositeGender(undefined)).toBeUndefined();
    expect(privateService.getProfileGender({})).toBeUndefined();

    const defaults = privateService.buildPreferenceFilter(
      userId,
      Gender.FEMALE,
      interacted,
      null,
      { personal: { religion: 'hindu' } },
    );
    expect(defaults).toMatchObject({
      age: { $gte: 20, $lte: 30 },
      'personal.religion': 'hindu',
    });
    privateService.buildPreferenceFilter(
      userId,
      undefined,
      interacted,
      null,
      {},
    );

    for (const filters of [
      { height: { min: 150 } },
      { height: { max: 180 } },
      { state: ['MH'] },
      { country: ['India'] },
    ]) {
      expect(
        privateService.buildPreferenceFilter(
          userId,
          Gender.FEMALE,
          interacted,
          { filters },
          { age: 30, personal: {} },
        ),
      ).toEqual(expect.any(Object));
    }
    expect(
      privateService.buildDiscoveryFilter(
        userId,
        Gender.FEMALE,
        interacted,
        null,
        myProfile,
      ),
    ).toEqual(expect.any(Object));
  });

  it('applies partial query filters and verification constraints', async () => {
    const privateService = service as any;
    for (const query of [
      { minAge: 20, minHeight: 150 },
      { maxAge: 40, maxHeight: 190 },
      {},
    ]) {
      const filter: Record<string, unknown> = {};
      privateService.applyQueryFilters(filter, query);
    }
    const filter: Record<string, unknown> = { userId: 'unexpected' };
    await privateService.applyVerificationConstraint(filter, false);
    await privateService.applyVerificationConstraint(filter, true);
    expect((filter.userId as Record<string, unknown>).$in).toHaveLength(1);
    expect(privateService.requiresVerifiedProfiles(null, {})).toBe(false);
    expect(
      privateService.requiresVerifiedProfiles(null, { verifiedOnly: true }),
    ).toBe(true);
    expect(
      privateService.requiresVerifiedProfiles(
        { settings: { profileVerificationRequired: true } },
        {},
      ),
    ).toBe(true);
  });

  it('handles image, compatibility, and boost fallbacks', async () => {
    const privateService = service as any;
    const first = profile(firstId, 60);
    const second = profile(secondId, 30);
    repo.getActiveMediaByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(firstId), url: 'one' },
    ]);
    const withImages = await privateService.withImages([first, second]);
    expect(withImages[0].images).toHaveLength(1);
    expect(withImages[1].images).toEqual([]);
    await privateService.withCompatibility(myProfile, null, [first]);

    const thirdId = new Types.ObjectId().toString();
    profileBoostService.getActiveBoostMap.mockResolvedValue(
      new Map([
        [firstId, { multiplier: undefined, endsAt: new Date() }],
        [secondId, { multiplier: 3, endsAt: new Date() }],
        [thirdId, { multiplier: 1, endsAt: new Date() }],
      ]),
    );
    const boosted = await privateService.withBoosts([
      { ...first, matchScore: undefined, profileScore: 60 },
      { ...second, matchScore: 50 },
      { _id: new Types.ObjectId(), userId: new Types.ObjectId(thirdId) },
    ]);
    expect(boosted[0].boostedMatchScore).toBe(75);
    expect(boosted[1].boostedMatchScore).toBe(100);
    expect(boosted[2].boostedMatchScore).toBe(0);
  });

  it('deduplicates object ids, escapes regex, and exposes pagination branches', () => {
    const privateService = service as any;
    const id = new Types.ObjectId();
    expect(privateService.uniqueObjectIds([id, id])).toHaveLength(1);
    expect(privateService.escapeRegex('a.b')).toBe('a\\.b');
    expect(privateService.paginate([], 50, 0, 20, 1).meta).toMatchObject({
      hasNextPage: true,
      hasPrevPage: false,
    });
  });
});
