/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { PersonalityBadge, ProfileStatus } from '@/common/enums';
import { ActivityPlatform } from '../enums/activity-log.enums';
import { AnalyticsPlatform } from '@/modules/analytics/enums/analytics-event.enum';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';
import { ProfilesService } from './profiles.service';

const USER_ID = new Types.ObjectId().toString();

const queryChain = (result: unknown) => {
  const chain = {
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn().mockResolvedValue(result),
  };
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  return chain;
};

const request = (overrides: Record<string, unknown> = {}) =>
  ({ headers: {}, ...overrides }) as never;

const baseProfileDto = () =>
  ({
    personal: {
      profileFor: 'self',
      firstName: 'Asha',
      lastName: 'Sharma',
      gender: 'female',
      dateOfBirth: '1995-05-10',
      religion: 'hindu',
      maritalStatus: 'never_married',
      religiousDetails: { caste: 'Any' },
      city: 'Mumbai',
      state: 'MH',
      country: 'India',
      isNri: true,
      residencyCountry: 'India',
      visaStatus: 'citizen',
      motherTongue: 'Hindi',
      languages: [' Hindi ', 'English'],
      hobbies: ['Travel'],
      personalityBadges: [
        PersonalityBadge.CURIOUS_LEARNER,
        PersonalityBadge.GOAL_ORIENTED,
        PersonalityBadge.CONSISTENT_PRACTICE,
      ],
    },
    physical: { height: 165 },
    education: { qualification: 'bachelors', occupation: 'Engineer' },
    family: {},
  }) as never;

const createFixture = () => {
  const userRepo = { findById: jest.fn() };
  const profileRepo = {
    exists: jest.fn(),
    create: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    archiveInactive: jest.fn(),
  };
  const cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
  const activityLogModel = { create: jest.fn() };
  const verificationModel = { findOne: jest.fn() };
  const notificationsService = { notify: jest.fn() };
  const analyticsService = { trackEvent: jest.fn() };
  const mediaService = {
    getImages: jest.fn(),
    getVideos: jest.fn(),
    addImages: jest.fn(),
  };
  const profileScoringService = { calculate: jest.fn() };
  const settingsService = { getOrCreateAllUserSettings: jest.fn() };
  const referralsService = { awardProfileCompletionReward: jest.fn() };
  const logger = { error: jest.fn() };

  const service = new ProfilesService(
    userRepo as never,
    profileRepo as never,
    cache as never,
    activityLogModel as never,
    verificationModel as never,
    notificationsService as never,
    analyticsService as never,
    mediaService as never,
    profileScoringService as never,
    settingsService as never,
    referralsService as never,
    logger as never,
  );

  profileRepo.exists.mockResolvedValue(false);
  cache.get.mockResolvedValue(null);
  cache.set.mockResolvedValue(undefined);
  cache.del.mockResolvedValue(undefined);
  userRepo.findById.mockResolvedValue({
    _id: USER_ID,
    isEmailVerified: true,
    isPhoneVerified: false,
  });
  verificationModel.findOne.mockReturnValue(queryChain(null));
  notificationsService.notify.mockResolvedValue({ _id: 'notification-1' });
  analyticsService.trackEvent.mockResolvedValue({ _id: 'event-1' });
  activityLogModel.create.mockResolvedValue({ _id: 'activity-1' });
  mediaService.getImages.mockResolvedValue([]);
  mediaService.getVideos.mockResolvedValue([]);
  mediaService.addImages.mockResolvedValue([]);
  settingsService.getOrCreateAllUserSettings.mockResolvedValue({});
  profileScoringService.calculate.mockReturnValue({
    missingFields: [],
    profileCompletionPercentage: 75,
    profileScore: 80,
    visibilityScore: 70,
  });

  return {
    activityLogModel,
    analyticsService,
    cache,
    logger,
    mediaService,
    notificationsService,
    profileRepo,
    profileScoringService,
    service,
    settingsService,
    userRepo,
    verificationModel,
  };
};

type TestableProfilesService = {
  applyUpdate(
    req: never,
    userId: string,
    dto: Record<string, unknown>,
    source: string,
    options?: Record<string, boolean>,
  ): Promise<unknown>;
  buildCreatePayload(dto: never): Record<string, unknown>;
  normalizeUpdate(
    dto: Record<string, unknown>,
    existing: Record<string, unknown>,
  ): Record<string, unknown>;
  enrichProfile(profile: Record<string, unknown>): Record<string, unknown>;
  withVerificationStatus(
    userId: string,
    profile: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  calculateAge(date: Date): number;
  getMediaSummaryFromProfile(profile: Record<string, unknown>): unknown;
  buildSearchTags(dto: never): string[];
  buildSearchTagsFromMerged(profile: Record<string, unknown>): string[];
  deduplicateTags(raw: Array<string | undefined>): string[];
  logActivity(
    req: never,
    userId: string,
    source: string,
    patch: Record<string, unknown>,
    changedFields?: string[],
  ): Promise<void>;
  fireAnalytics(
    req: never,
    userId: string,
    source: string,
    changedFields: string[],
    options?: { notifyUser: boolean; trackProfileUpdatedAnalytics: boolean },
  ): void;
  getChangedProfileFields(
    existing: Record<string, unknown>,
    normalized: Record<string, unknown>,
  ): string[];
  normalizeProfileValue(value: unknown): unknown;
  getHeader(req: never, key: string): string | undefined;
  toAnalyticsPlatform(value: string): AnalyticsPlatform;
  toActivityPlatform(value: string): ActivityPlatform;
  getRegisterRequestContext(req: never): {
    platform: ActivityPlatform;
    ip?: string;
    device?: string;
  };
  resolvePersonalityBadges(
    badges?: Array<PersonalityBadge | string>,
  ): PersonalityBadge[];
  ensureDefaultPersonalityBadges(
    userId: string,
    profile: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  getHeaderString(req: never, key: string): string | undefined;
};

const testable = (service: ProfilesService) =>
  service as unknown as TestableProfilesService;

describe('ProfilesService', () => {
  it('rejects duplicate profiles and preserves application errors', async () => {
    const { profileRepo, service } = createFixture();
    profileRepo.exists.mockResolvedValue(true);

    await expect(
      service.createProfile(USER_ID, baseProfileDto()),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('creates a normalized profile payload', async () => {
    const { profileRepo, service } = createFixture();
    profileRepo.create.mockResolvedValue({ userId: USER_ID });

    await expect(
      service.createProfile(USER_ID, baseProfileDto()),
    ).resolves.toEqual({ userId: USER_ID });

    expect(profileRepo.create).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({
        status: ProfileStatus.ACTIVE,
        profileCompletionPercentage: 75,
        searchTags: expect.arrayContaining(['hindu', 'nri', 'hindi']),
      }),
    );
  });

  it('rejects profile creation for students below the minimum age', async () => {
    const { profileRepo, service } = createFixture();
    const dto = baseProfileDto() as unknown as {
      personal: { dateOfBirth: string };
    };
    const underageDate = new Date();
    underageDate.setFullYear(underageDate.getFullYear() - 3);
    dto.personal.dateOfBirth = underageDate.toISOString().slice(0, 10);

    await expect(
      service.createProfile(USER_ID, dto as never),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_REQUEST,
      meta: expect.objectContaining({
        reason: 'student_age_not_allowed',
        minimumAge: 5,
      }),
    });
    expect(profileRepo.create).not.toHaveBeenCalled();
  });

  it('maps unexpected profile creation failures', async () => {
    const { profileRepo, service } = createFixture();
    profileRepo.exists.mockRejectedValue(new Error('database unavailable'));

    await expect(
      service.createProfile(USER_ID, baseProfileDto()),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('returns cached profile data without querying storage', async () => {
    const { cache, profileRepo, service } = createFixture();
    cache.get.mockResolvedValue({ cached: true });

    await expect(service.getMyProfile(USER_ID)).resolves.toEqual({
      cached: true,
    });
    expect(profileRepo.findByUserId).not.toHaveBeenCalled();
  });

  it('rejects a missing profile and maps unexpected read failures', async () => {
    const first = createFixture();
    first.profileRepo.findByUserId.mockResolvedValue(null);
    await expect(first.service.getMyProfile(USER_ID)).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });

    const second = createFixture();
    second.profileRepo.findByUserId.mockRejectedValue(new Error('failed'));
    await expect(second.service.getMyProfile(USER_ID)).rejects.toMatchObject({
      code: ErrorCode.INVALID_REQUEST,
    });
  });

  it('enriches, verifies, and caches profile media using the primary video', async () => {
    const fixture = createFixture();
    fixture.profileRepo.findByUserId.mockResolvedValue({
      personal: {
        profileFor: 'self',
        firstName: 'Asha',
        gender: 'female',
        dateOfBirth: '1995-05-10',
        religion: 'hindu',
        maritalStatus: 'never_married',
        aboutMe: 'Hello',
        personalityBadges: ['one', 'two', 'three'],
      },
      physical: { height: 165 },
      education: {
        qualification: 'bachelors',
        field: 'Grade 11',
        university: 'Mentora Test School',
        occupation: 'Engineer',
      },
      family: { fatherName: 'Ravi Sharma' },
      profileCompletionPercentage: 90,
      profileScore: 85,
      visibilityScore: 80,
      missingFields: ['photo'],
    });
    fixture.mediaService.getImages.mockResolvedValue([{ id: 'image-1' }]);
    fixture.mediaService.getVideos.mockResolvedValue([
      { id: 'video-1' },
      { id: 'video-2', isPrimary: true },
    ]);
    fixture.verificationModel.findOne.mockReturnValue(
      queryChain({
        status: VerificationStatus.APPROVED,
        provider: 'manual',
      }),
    );

    const result = await fixture.service.getMyProfile(USER_ID);

    expect(result).toMatchObject({
      videoIntro: { id: 'video-2', isPrimary: true },
      verification: { status: VerificationStatus.APPROVED },
      accountVerification: { emailVerified: true, phoneVerified: false },
      summary: { hasAboutMe: true, profileScore: 85 },
      sections: {
        personal: { completed: true },
        academic: { completed: true },
        parents: { completed: true },
      },
    });
    expect(fixture.cache.set).toHaveBeenCalledWith(
      `profile:${USER_ID}`,
      result,
      300,
    );
  });

  it('adds default badges and uses first or null video fallbacks', async () => {
    const fixture = createFixture();
    fixture.profileRepo.findByUserId.mockResolvedValue({ personal: {} });
    fixture.mediaService.getVideos.mockResolvedValueOnce([{ id: 'video-1' }]);

    const first = (await fixture.service.getMyProfile(USER_ID)) as Record<
      string,
      unknown
    >;
    expect(first.videoIntro).toEqual({ id: 'video-1' });
    expect(fixture.profileRepo.update).toHaveBeenCalled();
    expect(fixture.cache.del).toHaveBeenCalledWith(`profile:${USER_ID}`);

    fixture.cache.get.mockResolvedValue(null);
    fixture.profileRepo.findByUserId.mockResolvedValue({
      personal: { personalityBadges: ['one', 'two', 'three'] },
    });
    fixture.mediaService.getVideos.mockResolvedValue([]);
    const second = (await fixture.service.getMyProfile(USER_ID)) as Record<
      string,
      unknown
    >;
    expect(second.videoIntro).toBeNull();
  });

  it('delegates section updates with their production options', async () => {
    const { service } = createFixture();
    const privateService = testable(service);
    const applyUpdate = jest
      .spyOn(privateService, 'applyUpdate')
      .mockResolvedValue({ updated: true });
    const req = request();

    await service.updatePersonalInfo(req, USER_ID, {
      firstName: 'Asha',
    } as never);
    await service.updatePhysicalInfo(req, USER_ID, { accessibilityNeeds: [] });
    await service.updateEducationInfo(req, USER_ID, {
      occupation: 'Engineer',
    } as never);
    await service.updateFamilyInfo(req, USER_ID, {});
    await service.updateLocation(req, USER_ID, {
      latitude: 19.07,
      longitude: 72.87,
    });

    expect(applyUpdate).toHaveBeenCalledTimes(5);
    expect(applyUpdate).toHaveBeenLastCalledWith(
      req,
      USER_ID,
      expect.objectContaining({
        location: { type: 'Point', coordinates: [72.87, 19.07] },
        lastActiveAt: expect.any(Date),
      }),
      'profile-location-update',
      { notifyUser: false, trackProfileUpdatedAnalytics: false },
    );
  });

  it('handles missing, unchanged, updated, and failed profile updates', async () => {
    const missing = createFixture();
    missing.profileRepo.findByUserId.mockResolvedValue(null);
    await expect(
      testable(missing.service).applyUpdate(
        request(),
        USER_ID,
        { personal: {} },
        'test',
      ),
    ).rejects.toMatchObject({ code: ErrorCode.PROFILE_NOT_FOUND });

    const unchanged = createFixture();
    const existing = { personal: { firstName: 'Asha' } };
    unchanged.profileRepo.findByUserId.mockResolvedValue(existing);
    jest
      .spyOn(testable(unchanged.service), 'normalizeUpdate')
      .mockReturnValue({ searchTags: [], lastActiveAt: new Date() });
    await testable(unchanged.service).applyUpdate(
      request(),
      USER_ID,
      {},
      'test',
    );
    expect(unchanged.profileRepo.update).not.toHaveBeenCalled();

    const updated = createFixture();
    updated.profileRepo.findByUserId.mockResolvedValue(existing);
    jest
      .spyOn(testable(updated.service), 'normalizeUpdate')
      .mockReturnValue({ personal: { firstName: 'Riya' } });
    updated.profileRepo.update.mockResolvedValue({
      toObject: () => ({ personal: { firstName: 'Riya' } }),
    });
    await testable(updated.service).applyUpdate(
      request({ headers: { 'x-platform': 'android' } }),
      USER_ID,
      { personal: { firstName: 'Riya' } },
      'test',
    );
    expect(updated.cache.del).toHaveBeenCalled();
    expect(updated.activityLogModel.create).toHaveBeenCalled();
    expect(updated.notificationsService.notify).toHaveBeenCalled();
    expect(updated.analyticsService.trackEvent).toHaveBeenCalled();

    const failed = createFixture();
    failed.profileRepo.findByUserId.mockRejectedValue(new Error('failed'));
    await expect(
      testable(failed.service).applyUpdate(
        request(),
        USER_ID,
        {},
        'broken-source',
      ),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('uses the existing profile when an update result is null', async () => {
    const fixture = createFixture();
    fixture.profileRepo.findByUserId.mockResolvedValue({
      personal: { firstName: 'Asha' },
    });
    jest
      .spyOn(testable(fixture.service), 'normalizeUpdate')
      .mockReturnValue({ personal: { firstName: 'Riya' } });
    fixture.profileRepo.update.mockResolvedValue(null);

    const result = await testable(fixture.service).applyUpdate(
      request(),
      USER_ID,
      { personal: { firstName: 'Riya' } },
      'test',
      { notifyUser: false, trackProfileUpdatedAnalytics: false },
    );

    expect(result).toMatchObject({ personal: { firstName: 'Asha' } });
    expect(fixture.notificationsService.notify).not.toHaveBeenCalled();
  });

  it('rejects changes to identity fields after profile creation', async () => {
    const fixture = createFixture();
    fixture.profileRepo.findByUserId.mockResolvedValue({
      personal: {
        profileFor: 'self',
        gender: 'female',
        dateOfBirth: '1995-05-10T00:00:00.000Z',
      },
    });

    await expect(
      fixture.service.updatePersonalInfo(request(), USER_ID, {
        profileFor: 'self',
        gender: 'male',
        dateOfBirth: '1995-05-10',
      } as never),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_REQUEST,
      meta: expect.objectContaining({
        reason: 'immutable_identity_fields',
        fields: ['gender'],
      }),
    });
    expect(fixture.profileRepo.update).not.toHaveBeenCalled();
  });

  it('normalizes every profile section and recalculates derived values', () => {
    const { service } = createFixture();
    const result = testable(service).normalizeUpdate(
      {
        personal: {
          firstName: 'Riya',
          dateOfBirth: '2000-12-31',
          personalityBadges: 'invalid',
        },
        physical: { height: 170 },
        education: { occupation: 'Architect' },
        family: {},
        location: { type: 'Point', coordinates: [1, 2] },
      },
      { images: [{}], videoIntro: {}, personal: {}, physical: {} },
    );

    expect(result).toMatchObject({
      personal: expect.objectContaining({
        firstName: 'Riya',
        personalityBadges: expect.any(Array),
      }),
      physical: { height: 170 },
      education: { occupation: 'Architect' },
      location: { type: 'Point', coordinates: [1, 2] },
      profileCompletionPercentage: 75,
      profileScore: 80,
      visibilityScore: 70,
    });
    expect(result.age).toEqual(expect.any(Number));
  });

  it('normalizes empty updates and absent existing sections', () => {
    const { service } = createFixture();
    const result = testable(service).normalizeUpdate({}, {});

    expect(result).toMatchObject({
      searchTags: [],
      profileCompletionPercentage: 75,
      lastActiveAt: expect.any(Date),
    });
  });

  it('normalizes new personal and physical sections without a birth-date change', () => {
    const { service } = createFixture();
    const result = testable(service).normalizeUpdate(
      {
        personal: {
          firstName: 'Asha',
          personalityBadges: ['one', 'two', 'three'],
        },
        physical: { height: 165 },
      },
      {},
    );

    expect(result.personal).toMatchObject({
      firstName: 'Asha',
      personalityBadges: ['one', 'two', 'three'],
    });
    expect(result.age).toBeUndefined();
    expect(result.physical).toEqual({ height: 165 });
  });

  it('enriches incomplete and malformed profile summaries safely', () => {
    const { service } = createFixture();
    const result = testable(service).enrichProfile({
      profileCompletionPercentage: '12',
      profileScore: undefined,
      visibilityScore: null,
      missingFields: 'invalid',
      personal: {},
      physical: {},
      education: {},
      family: null,
    });

    expect(result).toMatchObject({
      summary: {
        profileCompletionPercentage: 12,
        profileScore: 0,
        visibilityScore: 0,
        missingFields: [],
        hasAboutMe: false,
      },
      sections: {
        personal: { completed: false },
        academic: { completed: false },
        parents: { completed: false },
      },
    });
  });

  it('attaches verification and account fallbacks', async () => {
    const fixture = createFixture();
    fixture.userRepo.findById.mockResolvedValue(null);
    fixture.verificationModel.findOne.mockReturnValue(queryChain(null));

    await expect(
      testable(fixture.service).withVerificationStatus(USER_ID, {}),
    ).resolves.toMatchObject({
      verification: { status: VerificationStatus.NOT_STARTED },
      accountVerification: { emailVerified: false, phoneVerified: false },
    });
  });

  it('calculates age before and after the birthday boundary', () => {
    const { service } = createFixture();
    const privateService = testable(service);
    const today = new Date();
    const beforeBirthday = new Date(
      today.getFullYear() - 30,
      (today.getMonth() + 1) % 12,
      today.getDate(),
    );
    const passedBirthday = new Date(
      today.getFullYear() - 30,
      today.getMonth(),
      Math.max(1, today.getDate() - 1),
    );

    expect(privateService.calculateAge(beforeBirthday)).toBeGreaterThanOrEqual(
      29,
    );
    expect(privateService.calculateAge(passedBirthday)).toBe(30);
  });

  it('refreshes derived scores and handles absent or malformed media', async () => {
    const missing = createFixture();
    missing.profileRepo.findByUserId.mockResolvedValue(null);
    await expect(
      missing.service.refreshDerivedScores(USER_ID),
    ).resolves.toBeNull();

    const fixture = createFixture();
    fixture.profileRepo.findByUserId.mockResolvedValue({ personal: {} });
    fixture.mediaService.getImages.mockResolvedValue('invalid');
    fixture.mediaService.getVideos.mockResolvedValue(null);
    fixture.verificationModel.findOne.mockReturnValue(queryChain(null));
    fixture.profileRepo.update.mockResolvedValue({ updated: true });

    await expect(
      fixture.service.refreshDerivedScores(USER_ID),
    ).resolves.toEqual({
      updated: true,
    });
    expect(fixture.profileScoringService.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: VerificationStatus.NOT_STARTED,
      }),
      { imageCount: 0, videoCount: 0 },
    );
  });

  it('uses media counts and approved verification when refreshing scores', async () => {
    const fixture = createFixture();
    fixture.profileRepo.findByUserId.mockResolvedValue({});
    fixture.mediaService.getImages.mockResolvedValue([{}, {}]);
    fixture.mediaService.getVideos.mockResolvedValue([{}]);
    fixture.verificationModel.findOne.mockReturnValue(
      queryChain({ status: VerificationStatus.APPROVED }),
    );

    await fixture.service.refreshDerivedScores(USER_ID);

    expect(fixture.profileScoringService.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: VerificationStatus.APPROVED,
      }),
      { imageCount: 2, videoCount: 1 },
    );
  });

  it('skips invalid archive windows and archives eligible profiles', async () => {
    const fixture = createFixture();
    await expect(
      fixture.service.archiveInactiveProfiles(0, 10),
    ).resolves.toEqual({
      matchedCount: 0,
      modifiedCount: 0,
      skipped: true,
    });

    fixture.profileRepo.archiveInactive.mockResolvedValue({
      matchedCount: 2,
      modifiedCount: 2,
    });
    const result = await fixture.service.archiveInactiveProfiles(30, 10);
    expect(result).toMatchObject({
      matchedCount: 2,
      modifiedCount: 2,
      skipped: false,
      inactiveDays: 30,
      cutoff: expect.any(Date),
    });
  });

  it('builds deterministic search tags and media summaries', () => {
    const { service } = createFixture();
    const privateService = testable(service);

    expect(privateService.buildSearchTags(baseProfileDto())).toEqual(
      expect.arrayContaining(['hindu', 'nri', 'hindi', 'travel']),
    );
    expect(
      privateService.buildSearchTagsFromMerged({
        personal: {
          isNri: false,
          languages: 'invalid',
          hobbies: null,
          personalityBadges: {},
        },
      }),
    ).toEqual([]);
    expect(
      privateService.deduplicateTags([
        ' Hindi ',
        'hindi',
        '',
        undefined,
        'English',
      ]),
    ).toEqual(['hindi', 'english']);
    expect(privateService.getMediaSummaryFromProfile({})).toEqual({
      imageCount: undefined,
      videoCount: undefined,
    });
  });

  it('handles missing create-tag arrays and populated merged tag arrays', () => {
    const { service } = createFixture();
    const privateService = testable(service);
    const dto = baseProfileDto() as unknown as {
      personal: Record<string, unknown>;
      education: Record<string, unknown>;
    };
    delete dto.personal.languages;
    delete dto.personal.hobbies;
    delete dto.personal.personalityBadges;

    expect(privateService.buildSearchTags(dto as never)).toEqual(
      expect.arrayContaining(['hindu', 'nri']),
    );
    expect(
      privateService.buildSearchTagsFromMerged({
        personal: {
          isNri: true,
          languages: ['Hindi'],
          hobbies: ['Travel'],
          personalityBadges: ['Friendly'],
        },
      }),
    ).toEqual(['nri', 'hindi', 'travel', 'friendly']);
  });

  it('logs activity with default changed fields and normalized headers', async () => {
    const fixture = createFixture();
    await testable(fixture.service).logActivity(
      request({
        headers: {
          'x-forwarded-for': ['10.0.0.1'],
          'x-device-id': ['device-1'],
          'user-agent': ['agent'],
          'x-platform': ['IOS'],
        },
      }),
      USER_ID,
      'test',
      { personal: {} },
    );

    expect(fixture.activityLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: '10.0.0.1',
        device: 'device-1',
        userAgent: 'agent',
        platform: ActivityPlatform.IOS,
        metadata: { source: 'test', changedFields: ['personal'] },
      }),
    );
  });

  it('runs optional profile analytics tasks independently', () => {
    const fixture = createFixture();
    const privateService = testable(fixture.service);

    privateService.fireAnalytics(
      request({ ip: '10.0.0.2', headers: { 'x-platform': 'android' } }),
      USER_ID,
      'test',
      ['personal'],
    );
    expect(fixture.notificationsService.notify).toHaveBeenCalled();
    expect(fixture.analyticsService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ platform: AnalyticsPlatform.ANDROID }),
    );

    jest.clearAllMocks();
    privateService.fireAnalytics(request(), USER_ID, 'test', [], {
      notifyUser: false,
      trackProfileUpdatedAnalytics: false,
    });
    expect(fixture.notificationsService.notify).not.toHaveBeenCalled();
    expect(fixture.analyticsService.trackEvent).not.toHaveBeenCalled();

    privateService.fireAnalytics(request(), USER_ID, 'test', [], {
      notifyUser: false,
      trackProfileUpdatedAnalytics: true,
    });
    expect(fixture.analyticsService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ platform: AnalyticsPlatform.WEB }),
    );
  });

  it('compares nested profile values deterministically and ignores derived fields', () => {
    const { service } = createFixture();
    const privateService = testable(service);
    const id = new Types.ObjectId();
    const date = new Date('2026-01-01T00:00:00.000Z');

    expect(
      privateService.getChangedProfileFields(
        { personal: { b: 2, a: 1 }, id, date },
        {
          personal: { a: 1, b: 2 },
          id: new Types.ObjectId(id.toString()),
          date: new Date(date),
          searchTags: ['ignored'],
          physical: [{ height: 170 }],
        },
      ),
    ).toEqual(['physical']);
    expect(privateService.normalizeProfileValue(null)).toBeNull();
    expect(privateService.normalizeProfileValue('value')).toBe('value');
  });

  it('normalizes direct, array, and invalid headers and platforms', () => {
    const { service } = createFixture();
    const privateService = testable(service);
    const req = request({
      headers: {
        direct: 'value',
        array: ['first'],
        empty: [],
        invalid: [42],
      },
    });

    expect(privateService.getHeader(req, 'direct')).toBe('value');
    expect(privateService.getHeader(req, 'array')).toBe('first');
    expect(privateService.getHeader(req, 'empty')).toBeUndefined();
    expect(privateService.getHeader(req, 'invalid')).toBeUndefined();
    expect(privateService.toAnalyticsPlatform('IOS')).toBe(
      AnalyticsPlatform.IOS,
    );
    expect(privateService.toAnalyticsPlatform('desktop')).toBe(
      AnalyticsPlatform.WEB,
    );
    expect(privateService.toActivityPlatform('ANDROID')).toBe(
      ActivityPlatform.ANDROID,
    );
    expect(privateService.toActivityPlatform('desktop')).toBe(
      ActivityPlatform.WEB,
    );
  });

  it('completes onboarding with media, preferences, settings, notifications, and analytics', async () => {
    const fixture = createFixture();
    const user = {
      _id: new Types.ObjectId(USER_ID),
      email: 'asha@example.com',
      phone: { phone: '9999999999' },
      isOnboardingCompleted: false,
      save: jest.fn().mockResolvedValue(undefined),
    };
    fixture.userRepo.findById.mockResolvedValue(user);
    fixture.mediaService.addImages.mockResolvedValue([{}, {}]);
    fixture.profileRepo.create.mockResolvedValue({});
    const profileImages = [{ originalname: 'photo.jpg' }] as never;
    const dto = {
      primaryImageIndex: '1',
      basic: {
        profileFor: 'self',
        firstName: 'Asha',
        lastName: 'Sharma',
        gender: 'female',
        dateOfBirth: '1995-05-10',
        religion: 'hindu',
        maritalStatus: 'never_married',
        country: 'India',
        height: 165,
        qualification: 'bachelors',
        occupation: 'Engineer',
      },
      preferences: {
        ageRange: [25, 35],
        heightRange: [150, 190],
        maritalStatus: ['never_married'],
        religion: ['hindu'],
        country: ['India'],
      },
    } as never;

    await expect(
      fixture.service.onboardingProfile(
        request({
          headers: {
            'x-forwarded-for': '10.0.0.1',
            'x-device-id': 'device-1',
            'user-agent': 'agent',
            'x-platform': 'ios',
          },
        }),
        USER_ID,
        dto,
        profileImages,
      ),
    ).resolves.toEqual({
      userId: user._id,
      isOnboardingCompleted: true,
    });

    expect(fixture.mediaService.addImages).toHaveBeenCalledWith(
      expect.any(Object),
      USER_ID,
      profileImages,
      1,
    );
    expect(
      fixture.settingsService.getOrCreateAllUserSettings,
    ).toHaveBeenCalled();
    expect(fixture.notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: ['in_app', 'push', 'email', 'sms'],
      }),
    );
    expect(fixture.analyticsService.trackEvent).toHaveBeenCalledTimes(3);
  });

  it('uses onboarding defaults when optional user and preference data is absent', async () => {
    const fixture = createFixture();
    const user = {
      _id: new Types.ObjectId(USER_ID),
      isOnboardingCompleted: false,
      save: jest.fn().mockResolvedValue(undefined),
    };
    fixture.userRepo.findById.mockResolvedValue(user);
    fixture.profileRepo.create.mockResolvedValue({});
    const dto = {
      basic: {
        profileFor: 'self',
        firstName: 'Asha',
        gender: 'female',
        dateOfBirth: '1995-05-10',
        religion: 'hindu',
        maritalStatus: 'never_married',
        country: 'India',
        height: 165,
        qualification: 'bachelors',
        occupation: 'Engineer',
      },
    } as never;

    await fixture.service.onboardingProfile(request(), USER_ID, dto, []);

    expect(fixture.mediaService.addImages).not.toHaveBeenCalled();
    expect(fixture.notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ channels: ['in_app', 'push'] }),
    );
  });

  it('updates existing profiles when retrying onboarding after a partial failure', async () => {
    const fixture = createFixture();
    const user = {
      _id: new Types.ObjectId(USER_ID),
      isOnboardingCompleted: false,
      save: jest.fn().mockResolvedValue(undefined),
    };
    fixture.userRepo.findById.mockResolvedValue(user);
    fixture.profileRepo.exists.mockResolvedValue(true);
    fixture.profileRepo.update.mockResolvedValue({});
    fixture.mediaService.getImages.mockResolvedValue([{ _id: 'image-1' }]);
    const dto = {
      basic: {
        profileFor: 'self',
        firstName: 'Asha',
        gender: 'female',
        dateOfBirth: '1995-05-10',
        religion: 'hindu',
        maritalStatus: 'never_married',
        country: 'india',
        height: 165,
        qualification: 'btech',
        occupation: 'Engineer',
      },
      preferences: {
        ageRange: { min: 25, max: 35 },
        heightRange: { min: 150, max: 190 },
        maritalStatus: ['never_married'],
        religion: ['hindu'],
        country: ['india'],
      },
    } as never;

    await expect(
      fixture.service.onboardingProfile(request(), USER_ID, dto, [
        { originalname: 'photo.jpg' },
      ] as never),
    ).resolves.toEqual({
      userId: user._id,
      isOnboardingCompleted: true,
    });

    expect(fixture.profileRepo.create).not.toHaveBeenCalled();
    expect(fixture.mediaService.addImages).not.toHaveBeenCalled();
    expect(fixture.profileRepo.update).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({ status: ProfileStatus.ACTIVE }),
    );
    expect(fixture.cache.del).toHaveBeenCalledWith(`profile:${USER_ID}`);
  });

  it('rejects onboarding for missing users and maps unexpected failures', async () => {
    const missing = createFixture();
    missing.userRepo.findById.mockResolvedValue(null);
    await expect(
      missing.service.onboardingProfile(request(), USER_ID, {} as never, []),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });

    const failed = createFixture();
    failed.userRepo.findById.mockRejectedValue('provider failed');
    await expect(
      failed.service.onboardingProfile(request(), USER_ID, {} as never, []),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
    expect(failed.logger.error).toHaveBeenCalledWith(
      'Profile onboarding failed',
      undefined,
    );
  });

  it('normalizes registration context, badges, and header strings', async () => {
    const fixture = createFixture();
    const privateService = testable(fixture.service);
    const req = request({
      headers: {
        'x-forwarded-for': ['10.0.0.1'],
        'user-agent': ['agent'],
        invalid: [42],
      },
    });

    expect(privateService.getRegisterRequestContext(req)).toEqual({
      platform: ActivityPlatform.WEB,
      ip: '10.0.0.1',
      device: 'agent',
    });
    expect(
      privateService.resolvePersonalityBadges([
        'one',
        'two',
        'three',
        ...Array(10).fill('x'),
      ]),
    ).toHaveLength(10);
    expect(privateService.resolvePersonalityBadges(['one'])).toEqual(
      expect.arrayContaining([PersonalityBadge.CURIOUS_LEARNER]),
    );
    expect(privateService.getHeaderString(req, 'user-agent')).toBe('agent');
    expect(privateService.getHeaderString(req, 'invalid')).toBeUndefined();

    const profile = {
      personal: { personalityBadges: ['one', 'two', 'three'] },
    };
    await expect(
      privateService.ensureDefaultPersonalityBadges(USER_ID, profile),
    ).resolves.toBe(profile);

    const profileWithoutPersonal =
      await privateService.ensureDefaultPersonalityBadges(USER_ID, {});
    expect(profileWithoutPersonal.personal).toMatchObject({
      personalityBadges: expect.any(Array),
    });
    expect(privateService.enrichProfile({})).toMatchObject({
      sections: {
        personal: { completed: false },
        academic: { completed: false },
        parents: { completed: false },
      },
    });
  });
});
