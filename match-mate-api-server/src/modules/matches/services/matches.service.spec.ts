/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { FeatureKey } from '@/common/enums';
import { InterestStatus } from '../enums/match.enums';
import { MatchesService } from './matches.service';

describe('MatchesService', () => {
  const repo = {
    getProfilesByUserIds: jest.fn(),
    getActiveMediaByUserIds: jest.fn(),
    getExistingInterest: jest.fn(),
    sendInterest: jest.fn(),
    getInterestById: jest.fn(),
    updateInterestStatus: jest.fn(),
    createMatch: jest.fn(),
    getMatchesForUser: jest.fn(),
    countMatchesForUserExcluding: jest.fn(),
    getReceivedInterests: jest.fn(),
    countReceivedInterests: jest.fn(),
    getSentInterests: jest.fn(),
    countSentInterests: jest.fn(),
    getProfileByUserId: jest.fn(),
    addShortlist: jest.fn(),
    removeShortlist: jest.fn(),
    getShortlistedProfiles: jest.fn(),
    countShortlisted: jest.fn(),
    getShortlistedUserIds: jest.fn(),
    getProfileViewers: jest.fn(),
    countProfileViewers: jest.fn(),
    getStats: jest.fn(),
    unmatchUsers: jest.fn(),
    deleteInterest: jest.fn(),
    getPreferenceByUserId: jest.fn(),
    getMatchBetweenUsers: jest.fn(),
    getActiveMediaByUserId: jest.fn(),
    recordProfileView: jest.fn(),
    expireMatches: jest.fn(),
  };
  const settingsService = {
    isBlockedBetween: jest.fn(),
    isHiddenBetween: jest.fn(),
    getUnavailableRelationUserIds: jest.fn(),
    getPrivacy: jest.fn(),
  };
  const notificationService = {
    notifyInterestSent: jest.fn(),
    notifyInterestResponded: jest.fn(),
    notifyUnmatched: jest.fn(),
  };
  const featureService = {
    checkAccess: jest.fn(),
    getFeaturesForUser: jest.fn(),
    checkUsageLimit: jest.fn(),
    checkUniqueUsageLimit: jest.fn(),
  };
  const compatibilityService = {
    calculateMutualCompatibility: jest.fn(),
  };
  const configService = { get: jest.fn() };

  let service: MatchesService;
  let userId: string;
  let targetId: string;
  let interestId: string;
  let matchId: string;

  const profile = (id: string) => ({
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(id),
    age: 30,
    lastActiveAt: new Date(),
    personal: {
      firstName: 'Asha',
      lastName: 'Rao',
      city: 'Pune',
      state: 'MH',
      country: 'India',
      isNri: false,
      residencyCountry: 'India',
      visaStatus: 'citizen',
      gender: 'female',
      maritalStatus: 'never_married',
      religion: 'hindu',
      religiousDetails: { caste: 'caste' },
      aboutMe: 'About',
      motherTongue: 'marathi',
      hobbies: ['reading'],
      languages: ['english'],
    },
    physical: { height: 165 },
    education: { qualification: 'graduate' },
    family: { type: 'nuclear' },
  });

  const interest = (overrides: Record<string, unknown> = {}) => ({
    _id: new Types.ObjectId(interestId),
    senderId: new Types.ObjectId(targetId),
    receiverId: new Types.ObjectId(userId),
    status: InterestStatus.PENDING,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new Types.ObjectId().toString();
    targetId = new Types.ObjectId().toString();
    interestId = new Types.ObjectId().toString();
    matchId = new Types.ObjectId().toString();
    settingsService.isBlockedBetween.mockResolvedValue(false);
    settingsService.isHiddenBetween.mockResolvedValue(false);
    settingsService.getUnavailableRelationUserIds.mockResolvedValue([]);
    settingsService.getPrivacy.mockResolvedValue(null);
    repo.getProfilesByUserIds.mockResolvedValue([]);
    repo.getActiveMediaByUserIds.mockResolvedValue([]);
    repo.getPreferenceByUserId.mockResolvedValue(null);
    repo.getMatchBetweenUsers.mockResolvedValue(null);
    repo.getActiveMediaByUserId.mockResolvedValue([]);
    repo.getExistingInterest.mockResolvedValue(null);
    featureService.checkAccess.mockResolvedValue({ allowed: true });
    featureService.getFeaturesForUser.mockResolvedValue({
      contact_view_limit: -1,
    });
    featureService.checkUsageLimit.mockResolvedValue(undefined);
    featureService.checkUniqueUsageLimit.mockResolvedValue(undefined);
    configService.get.mockImplementation(
      (_key: string, fallback?: unknown) => fallback,
    );
    compatibilityService.calculateMutualCompatibility.mockReturnValue({
      score: 75,
    });
    service = new MatchesService(
      repo as never,
      settingsService as never,
      notificationService as never,
      featureService as never,
      compatibilityService as never,
      configService as never,
    );
  });

  it('sends interests with interaction and duplicate protections', async () => {
    await expect(service.sendInterest(userId, userId)).rejects.toMatchObject({
      code: ErrorCode.INTEREST_CANNOT_SEND_SELF,
    });
    settingsService.isBlockedBetween.mockResolvedValue(true);
    await expect(service.sendInterest(userId, targetId)).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
    settingsService.isBlockedBetween.mockResolvedValue(false);
    settingsService.isHiddenBetween.mockResolvedValue(true);
    await expect(service.sendInterest(userId, targetId)).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
    settingsService.isHiddenBetween.mockResolvedValue(false);
    repo.getExistingInterest.mockResolvedValue(interest());
    await expect(service.sendInterest(userId, targetId)).rejects.toMatchObject({
      code: ErrorCode.INTEREST_ALREADY_SENT,
    });

    const sent = interest({
      senderId: new Types.ObjectId(userId),
      receiverId: new Types.ObjectId(targetId),
    });
    repo.getExistingInterest.mockResolvedValue(null);
    repo.sendInterest.mockResolvedValue(sent);
    await expect(service.sendInterest(userId, targetId)).resolves.toBe(sent);
    expect(notificationService.notifyInterestSent).toHaveBeenCalledWith(
      userId,
      targetId,
      interestId,
    );
  });

  it('accepts and rejects pending interests and enforces ownership/status', async () => {
    repo.getInterestById.mockResolvedValue(null);
    await expect(
      service.respondToInterest(userId, interestId, 'ACCEPT'),
    ).rejects.toMatchObject({ code: ErrorCode.INTEREST_NOT_FOUND });
    repo.getInterestById.mockResolvedValue(
      interest({ receiverId: new Types.ObjectId(targetId) }),
    );
    await expect(
      service.respondToInterest(userId, interestId, 'ACCEPT'),
    ).rejects.toMatchObject({ code: ErrorCode.ACCESS_DENIED });
    repo.getInterestById.mockResolvedValue(
      interest({ status: InterestStatus.ACCEPTED }),
    );
    await expect(
      service.respondToInterest(userId, interestId, 'REJECT'),
    ).rejects.toMatchObject({ code: ErrorCode.INTEREST_ALREADY_RESPONDED });

    const pending = interest();
    repo.getInterestById.mockResolvedValue(pending);
    repo.updateInterestStatus.mockResolvedValue({
      ...pending,
      status: InterestStatus.REJECTED,
    });
    await expect(
      service.respondToInterest(userId, interestId, 'REJECT'),
    ).resolves.toMatchObject({ success: true });
    expect(repo.createMatch).not.toHaveBeenCalled();

    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'matches.expiryEnabled') return true;
      if (key === 'matches.expiryDays') return 30;
      return fallback;
    });
    repo.updateInterestStatus.mockResolvedValue({
      ...pending,
      status: InterestStatus.ACCEPTED,
    });
    repo.createMatch.mockResolvedValue({ _id: new Types.ObjectId(matchId) });
    await service.respondToInterest(userId, interestId, 'ACCEPT');
    expect(repo.createMatch).toHaveBeenCalledWith(
      targetId,
      userId,
      expect.any(Date),
    );
    expect(
      notificationService.notifyInterestResponded,
    ).toHaveBeenLastCalledWith(
      userId,
      pending,
      InterestStatus.ACCEPTED,
      matchId,
    );
  });

  it('lists matches and sent/received interests with enriched profiles', async () => {
    const match = {
      _id: new Types.ObjectId(matchId),
      userId: new Types.ObjectId(userId),
      targetUserId: new Types.ObjectId(targetId),
    };
    const targetProfile = profile(targetId);
    const media = { userId: new Types.ObjectId(targetId), url: 'photo' };
    repo.getMatchesForUser.mockResolvedValue([match]);
    repo.countMatchesForUserExcluding.mockResolvedValue(1);
    repo.getProfilesByUserIds.mockResolvedValue([targetProfile]);
    repo.getActiveMediaByUserIds.mockResolvedValue([
      media,
      { ...media, url: 'two' },
    ]);
    await expect(service.getMyMatches(userId, 2, 10)).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          matchedUserId: targetId,
          profile: expect.objectContaining({ images: expect.any(Array) }),
        }),
      ],
      meta: { total: 1, page: 2, limit: 10, totalPages: 1 },
    });

    repo.getActiveMediaByUserIds.mockResolvedValue([]);
    await expect(service.getMyMatches(userId)).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          profile: expect.objectContaining({ images: [] }),
        }),
      ],
    });

    repo.getMatchesForUser.mockResolvedValue([
      {
        ...match,
        userId: new Types.ObjectId(targetId),
        targetUserId: new Types.ObjectId(userId),
      },
    ]);
    repo.getProfilesByUserIds.mockResolvedValue([]);
    await expect(service.getMyMatches(userId)).resolves.toMatchObject({
      data: [expect.objectContaining({ profile: undefined })],
    });

    const received = interest();
    const sent = interest({ senderId: userId, receiverId: targetId });
    repo.getReceivedInterests.mockResolvedValue([received]);
    repo.countReceivedInterests.mockResolvedValue(1);
    repo.getSentInterests.mockResolvedValue([sent]);
    repo.countSentInterests.mockResolvedValue(1);
    repo.getProfilesByUserIds.mockResolvedValue([targetProfile]);
    repo.getActiveMediaByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(targetId), url: 'one' },
      { userId: new Types.ObjectId(targetId), url: 'two' },
    ]);
    await expect(service.getReceivedInterests(userId)).resolves.toMatchObject({
      data: [expect.objectContaining({ profile: expect.any(Object) })],
    });
    repo.getActiveMediaByUserIds.mockResolvedValue([]);
    await expect(service.getSentInterests(userId)).resolves.toMatchObject({
      data: [expect.objectContaining({ profile: expect.any(Object) })],
    });
  });

  it('adds, removes, and lists shortlisted profiles', async () => {
    await expect(
      service.shortlistProfile(userId, userId),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_REQUEST,
    });
    repo.getProfileByUserId.mockResolvedValue(null);
    await expect(
      service.shortlistProfile(userId, targetId),
    ).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
    repo.getProfileByUserId.mockResolvedValue(profile(targetId));
    repo.addShortlist.mockResolvedValue({ _id: new Types.ObjectId() });
    await expect(
      service.shortlistProfile(userId, targetId),
    ).resolves.toMatchObject({
      data: { targetUserId: targetId, isShortlisted: true },
    });

    await expect(
      service.removeShortlistedProfile(userId, userId),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
    await expect(
      service.removeShortlistedProfile(userId, targetId),
    ).resolves.toMatchObject({ data: { isShortlisted: false } });

    const targetProfile = profile(targetId);
    repo.getShortlistedProfiles.mockResolvedValue([targetProfile]);
    repo.countShortlisted.mockResolvedValue(1);
    repo.getShortlistedUserIds.mockResolvedValue([targetId]);
    repo.getActiveMediaByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(targetId), url: 'one' },
      { userId: new Types.ObjectId(targetId), url: 'two' },
    ]);
    await expect(service.getShortlistedProfiles(userId)).resolves.toMatchObject(
      {
        data: [
          expect.objectContaining({
            isShortlisted: true,
            images: expect.any(Array),
          }),
        ],
      },
    );
    repo.getActiveMediaByUserIds.mockResolvedValue([]);
    repo.getShortlistedUserIds.mockResolvedValue([]);
    await expect(service.getShortlistedProfiles(userId)).resolves.toMatchObject(
      {
        data: [expect.objectContaining({ isShortlisted: false, images: [] })],
      },
    );
  });

  it('returns profile viewers and match statistics', async () => {
    const missingId = new Types.ObjectId().toString();
    repo.getProfileViewers.mockResolvedValue([
      { fromUserId: new Types.ObjectId(targetId), updatedAt: new Date() },
      { fromUserId: new Types.ObjectId(missingId), createdAt: new Date() },
    ]);
    repo.countProfileViewers.mockResolvedValue(2);
    repo.getProfilesByUserIds.mockResolvedValue([profile(targetId)]);
    repo.getActiveMediaByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(targetId), url: 'one' },
    ]);
    await expect(service.getWhoViewedMe(userId)).resolves.toMatchObject({
      data: [expect.objectContaining({ viewerId: targetId })],
      meta: expect.objectContaining({ total: 2 }),
    });
    repo.getProfileViewers.mockResolvedValue([
      { fromUserId: new Types.ObjectId(targetId), createdAt: new Date() },
    ]);
    repo.getActiveMediaByUserIds.mockResolvedValue([]);
    await expect(service.getWhoViewedMe(userId)).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          viewedAt: expect.any(Date),
          profile: expect.objectContaining({ images: [] }),
        }),
      ],
    });
    repo.getStats.mockResolvedValue({ activeMatches: 2 });
    await expect(service.getMatchStats(userId)).resolves.toEqual({
      activeMatches: 2,
    });
    expect(featureService.checkAccess).toHaveBeenCalledWith(
      FeatureKey.PROFILE_ANALYTICS,
      expect.objectContaining({ userId }),
    );
  });

  it('unmatches and withdraws interests with lifecycle protections', async () => {
    await expect(service.unmatch(userId, userId)).rejects.toMatchObject({
      code: ErrorCode.INVALID_REQUEST,
    });
    repo.unmatchUsers.mockResolvedValue(null);
    await expect(service.unmatch(userId, targetId)).rejects.toMatchObject({
      code: ErrorCode.MATCH_NOT_FOUND,
    });
    const match = { _id: new Types.ObjectId(matchId) };
    repo.unmatchUsers.mockResolvedValue(match);
    await expect(
      service.unmatch(userId, targetId, 'not compatible'),
    ).resolves.toMatchObject({
      data: match,
    });

    repo.getInterestById.mockResolvedValue(null);
    await expect(
      service.withdrawInterest(userId, interestId),
    ).rejects.toMatchObject({
      code: ErrorCode.INTEREST_NOT_FOUND,
    });
    repo.getInterestById.mockResolvedValue(interest());
    await expect(
      service.withdrawInterest(userId, interestId),
    ).rejects.toMatchObject({
      code: ErrorCode.ACCESS_DENIED,
    });
    repo.getInterestById.mockResolvedValue(
      interest({
        senderId: new Types.ObjectId(userId),
        status: InterestStatus.ACCEPTED,
      }),
    );
    await expect(
      service.withdrawInterest(userId, interestId),
    ).rejects.toMatchObject({
      code: ErrorCode.INTEREST_ALREADY_RESPONDED,
    });
    const pending = interest({ senderId: new Types.ObjectId(userId) });
    repo.getInterestById.mockResolvedValue(pending);
    repo.deleteInterest.mockResolvedValue(pending);
    await expect(service.withdrawInterest(userId, interestId)).resolves.toBe(
      pending,
    );
  });

  it('returns own profiles and denies missing, blocked, or hidden public profiles', async () => {
    const targetProfile = profile(targetId);
    repo.getProfileByUserId.mockResolvedValue(targetProfile);
    await expect(service.getMatchProfile(targetId, targetId)).resolves.toBe(
      targetProfile,
    );

    repo.getProfileByUserId.mockResolvedValue(null);
    await expect(
      service.getMatchProfile(userId, targetId),
    ).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
    repo.getProfileByUserId.mockResolvedValue(targetProfile);
    settingsService.isBlockedBetween.mockResolvedValue(true);
    await expect(
      service.getMatchProfile(userId, targetId),
    ).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
    settingsService.isBlockedBetween.mockResolvedValue(false);
    settingsService.isHiddenBetween.mockResolvedValue(true);
    await expect(
      service.getMatchProfile(userId, targetId),
    ).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
  });

  it('shapes unmatched profile privacy, blur, last-seen, and sent interests', async () => {
    const targetProfile = profile(targetId);
    repo.getProfileByUserId
      .mockResolvedValueOnce(targetProfile)
      .mockResolvedValueOnce(profile(userId));
    settingsService.getPrivacy
      .mockResolvedValueOnce({
        profileVisibility: 'everyone',
        showPhotosTo: 'everyone',
        blurPhotosForUnmatched: true,
        showOnlineStatus: true,
        showLastSeen: 'everyone',
        showExactAge: false,
        showPhone: true,
        showEmail: true,
        showIncome: true,
      })
      .mockResolvedValueOnce({ incognitoMode: false });
    settingsService.isHiddenBetween.mockResolvedValue(false);
    repo.getActiveMediaByUserId.mockResolvedValue([{ url: 'photo' }]);
    repo.getExistingInterest
      .mockResolvedValueOnce({
        _id: new Types.ObjectId(interestId),
        status: InterestStatus.PENDING,
      })
      .mockResolvedValueOnce(null);
    compatibilityService.calculateMutualCompatibility.mockReturnValue({
      score: 88,
    });
    const result = await service.getMatchProfile(userId, targetId);
    expect(result).toMatchObject({
      images: [
        expect.objectContaining({
          isBlurred: true,
          blurReason: 'interest_required',
        }),
      ],
      privacy: {
        isMatched: false,
        canViewPersonalDetails: true,
        canViewPhotos: false,
        photosBlurred: true,
        showPhone: false,
        showEmail: false,
        showIncome: true,
      },
      relationship: { interestDirection: 'sent' },
      matchScore: 88,
    });
    expect(repo.recordProfileView).toHaveBeenCalled();
  });

  it('shapes matched/private profiles and received/no-interest relationships', async () => {
    const targetProfile = profile(targetId);
    const viewerProfile = profile(userId);
    repo.getProfileByUserId
      .mockResolvedValueOnce(targetProfile)
      .mockResolvedValueOnce(viewerProfile);
    settingsService.getPrivacy
      .mockResolvedValueOnce({
        profileVisibility: 'accepted_matches',
        showPhotosTo: 'contacts_only',
        showOnlineStatus: false,
        showLastSeen: 'private',
        showExactAge: true,
        showPhone: true,
        showEmail: true,
      })
      .mockResolvedValueOnce({ incognitoMode: true });
    repo.getMatchBetweenUsers.mockResolvedValue({
      _id: new Types.ObjectId(matchId),
    });
    repo.getActiveMediaByUserId.mockResolvedValue([{ url: 'photo' }]);
    repo.getExistingInterest.mockResolvedValueOnce(null).mockResolvedValueOnce({
      _id: new Types.ObjectId(interestId),
      status: InterestStatus.ACCEPTED,
    });
    const result = await service.getMatchProfile(userId, targetId);
    expect(result).toMatchObject({
      privacy: {
        isMatched: true,
        canViewPersonalDetails: true,
        canViewPhotos: true,
        photosBlurred: false,
        showPhone: true,
        showEmail: true,
      },
      relationship: { interestDirection: 'received' },
    });
    expect(repo.recordProfileView).not.toHaveBeenCalled();

    repo.getProfileByUserId
      .mockReset()
      .mockResolvedValueOnce(targetProfile)
      .mockResolvedValueOnce(null);
    settingsService.getPrivacy
      .mockReset()
      .mockResolvedValueOnce({
        profileVisibility: 'private',
        showPhotosTo: 'private',
      })
      .mockResolvedValueOnce({ incognitoMode: true });
    repo.getMatchBetweenUsers.mockResolvedValue(null);
    repo.getExistingInterest.mockResolvedValue(null);
    const privateResult = await service.getMatchProfile(userId, targetId);
    expect(privateResult).toMatchObject({
      images: [],
      personal: expect.objectContaining({
        lastName: undefined,
        hobbies: [],
        languages: [],
      }),
      physical: undefined,
      relationship: { interestDirection: undefined },
    });
  });

  it('covers visibility and match-expiry policy branches', () => {
    const privateService = service as any;
    expect(privateService.canViewVisibility(undefined, false)).toBe(true);
    expect(privateService.canViewVisibility('public', false)).toBe(true);
    expect(privateService.canViewVisibility('accepted_matches', true)).toBe(
      true,
    );
    expect(privateService.canViewVisibility('contacts_only', false)).toBe(
      false,
    );
    expect(privateService.canViewVisibility('private', true)).toBe(false);

    expect(privateService.buildMatchExpiryDate()).toBeUndefined();
    configService.get.mockImplementation((key: string) =>
      key === 'matches.expiryEnabled' ? true : Number.NaN,
    );
    expect(privateService.buildMatchExpiryDate()).toBeUndefined();
    configService.get.mockImplementation((key: string) =>
      key === 'matches.expiryEnabled' ? true : 0,
    );
    expect(privateService.buildMatchExpiryDate()).toBeUndefined();
    repo.expireMatches.mockReturnValue({ modifiedCount: 2 });
    expect(service.expireOverdueMatches(10)).toEqual({ modifiedCount: 2 });
  });
});
