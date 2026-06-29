import { MatchesController } from './matches.controller';
import { SuccessCode } from '@/common/constants';

describe('MatchesController', () => {
  const userId = 'user-1';
  const targetUserId = 'user-2';
  const req = { user: { sub: userId } } as never;

  const matchesService = {
    getMyMatches: jest.fn(),
    getMatchStats: jest.fn(),
    getWhoViewedMe: jest.fn(),
    unmatch: jest.fn(),
    getShortlistedProfiles: jest.fn(),
    shortlistProfile: jest.fn(),
    removeShortlistedProfile: jest.fn(),
    getMatchProfile: jest.fn(),
    sendInterest: jest.fn(),
    respondToInterest: jest.fn(),
    withdrawInterest: jest.fn(),
    getReceivedInterests: jest.fn(),
    getSentInterests: jest.fn(),
  };

  const discoveryService = {
    getRecommendedMatches: jest.fn(),
    getNewMatches: jest.fn(),
    getNearbyMatches: jest.fn(),
    getOnlineMatches: jest.fn(),
  };

  const curatorService = {
    getCuratedMatches: jest.fn(),
    dismissCuratedMatch: jest.fn(),
  };

  let controller: MatchesController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MatchesController(
      matchesService as never,
      discoveryService as never,
      curatorService as never,
    );
  });

  it('delegates discovery feeds to the discovery and curator services', async () => {
    const query = { page: 2, limit: 10 } as never;
    discoveryService.getRecommendedMatches.mockResolvedValue(['recommended']);
    discoveryService.getNewMatches.mockResolvedValue(['new']);
    discoveryService.getNearbyMatches.mockResolvedValue(['nearby']);
    discoveryService.getOnlineMatches.mockResolvedValue(['online']);
    curatorService.getCuratedMatches.mockResolvedValue(['curated']);

    await expect(controller.getRecommended(req, query)).resolves.toMatchObject({
      code: SuccessCode.MATCHES_FETCHED,
      data: ['recommended'],
    });
    await controller.getNewMatches(req, query);
    await controller.getNearbyMatches(req, query);
    await controller.getOnlineMatches(req, query);
    await controller.getCuratedMatches(req, query);

    expect(discoveryService.getRecommendedMatches).toHaveBeenCalledWith(
      userId,
      query,
    );
    expect(discoveryService.getNewMatches).toHaveBeenCalledWith(userId, query);
    expect(discoveryService.getNearbyMatches).toHaveBeenCalledWith(
      userId,
      query,
    );
    expect(discoveryService.getOnlineMatches).toHaveBeenCalledWith(
      userId,
      query,
    );
    expect(curatorService.getCuratedMatches).toHaveBeenCalledWith(
      userId,
      query,
    );
  });

  it('handles interest send/respond/withdraw with the correct success codes', async () => {
    matchesService.sendInterest.mockResolvedValue({ id: 'interest-1' });
    matchesService.respondToInterest.mockResolvedValue({ accepted: true });
    matchesService.withdrawInterest.mockResolvedValue({ withdrawn: true });

    const sent = await controller.sendInterest(req, {
      receiverId: targetUserId,
    });
    const accepted = await controller.respondToInterest(req, {
      interestId: 'interest-1',
      action: 'ACCEPT',
    });
    const rejected = await controller.respondToInterest(req, {
      interestId: 'interest-1',
      action: 'REJECT',
    });
    const withdrawn = await controller.withdrawInterest(req, 'interest-1');

    expect(matchesService.sendInterest).toHaveBeenCalledWith(
      userId,
      targetUserId,
    );
    expect(matchesService.respondToInterest).toHaveBeenCalledWith(
      userId,
      'interest-1',
      'ACCEPT',
    );
    expect(sent.code).toBe(SuccessCode.INTEREST_SENT);
    expect(accepted.code).toBe(SuccessCode.INTEREST_ACCEPTED);
    expect(rejected.code).toBe(SuccessCode.INTEREST_REJECTED);
    expect(withdrawn.code).toBe(SuccessCode.INTEREST_WITHDRAWN);
  });

  it('shortlists and removes profiles for the authenticated user', async () => {
    matchesService.shortlistProfile.mockResolvedValue({ shortlisted: true });
    matchesService.removeShortlistedProfile.mockResolvedValue({
      shortlisted: false,
    });

    const added = await controller.shortlistProfile(req, targetUserId);
    const removed = await controller.removeShortlistedProfile(
      req,
      targetUserId,
    );

    expect(matchesService.shortlistProfile).toHaveBeenCalledWith(
      userId,
      targetUserId,
    );
    expect(matchesService.removeShortlistedProfile).toHaveBeenCalledWith(
      userId,
      targetUserId,
    );
    expect(added.code).toBe(SuccessCode.MATCH_SHORTLISTED);
    expect(removed.code).toBe(SuccessCode.MATCH_SHORTLIST_REMOVED);
  });

  it('passes paginated match list requests to the match service', async () => {
    const query = { page: 3, limit: 15 } as never;
    matchesService.getMyMatches.mockResolvedValue({ items: [] });
    matchesService.getWhoViewedMe.mockResolvedValue({ items: [] });
    matchesService.getShortlistedProfiles.mockResolvedValue({ items: [] });
    matchesService.getReceivedInterests.mockResolvedValue({ items: [] });
    matchesService.getSentInterests.mockResolvedValue({ items: [] });

    await controller.getMyMatches(req, query);
    await controller.getWhoViewedMe(req, query);
    await controller.getShortlistedProfiles(req, query);
    await controller.getReceivedInterests(req, query);
    await controller.getSentInterests(req, query);

    expect(matchesService.getMyMatches).toHaveBeenCalledWith(userId, 3, 15);
    expect(matchesService.getWhoViewedMe).toHaveBeenCalledWith(userId, 3, 15);
    expect(matchesService.getShortlistedProfiles).toHaveBeenCalledWith(
      userId,
      3,
      15,
    );
    expect(matchesService.getReceivedInterests).toHaveBeenCalledWith(
      userId,
      3,
      15,
    );
    expect(matchesService.getSentInterests).toHaveBeenCalledWith(userId, 3, 15);
  });

  it('dismisses curated matches and returns match statistics', async () => {
    curatorService.dismissCuratedMatch.mockResolvedValue({ dismissed: true });
    matchesService.getMatchStats.mockResolvedValue({ matches: 12 });

    const dismissed = await controller.dismissCuratedMatch(req, 'curated-1');
    const stats = await controller.getMatchStats(req);

    expect(curatorService.dismissCuratedMatch).toHaveBeenCalledWith(
      userId,
      'curated-1',
    );
    expect(matchesService.getMatchStats).toHaveBeenCalledWith(userId);
    expect(dismissed.code).toBe(SuccessCode.MATCH_REMOVED);
    expect(stats.code).toBe(SuccessCode.ANALYTICS_FETCHED);
  });

  it('unmatches and retrieves a target profile', async () => {
    matchesService.unmatch.mockResolvedValue({ removed: true });
    matchesService.getMatchProfile.mockResolvedValue({ userId: targetUserId });

    const unmatched = await controller.unmatch(req, targetUserId, {
      reason: 'not-compatible',
    });
    const profile = await controller.getMatchProfile(req, targetUserId);

    expect(matchesService.unmatch).toHaveBeenCalledWith(
      userId,
      targetUserId,
      'not-compatible',
    );
    expect(matchesService.getMatchProfile).toHaveBeenCalledWith(
      userId,
      targetUserId,
    );
    expect(unmatched.code).toBe(SuccessCode.MATCH_REMOVED);
    expect(profile.code).toBe(SuccessCode.MATCHES_FETCHED);
  });
});
