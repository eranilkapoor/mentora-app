/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsEventType,
  AnalyticsFunnelStage,
  AnalyticsGroupBy,
  AnalyticsPlatform,
} from '../enums/analytics-event.enum';

describe('AnalyticsService', () => {
  const repo = {
    create: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
    distinctUsers: jest.fn(),
    upsertDailySummary: jest.fn(),
    getDailySummaryByDay: jest.fn(),
    getDailySummaries: jest.fn(),
  };

  let service: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AnalyticsService(repo as never);
  });

  it('returns event taxonomy for clients', () => {
    const taxonomy = service.getEventTaxonomy();

    expect(taxonomy.eventTypes).toContain(AnalyticsEventType.APP_OPENED);
    expect(taxonomy.platforms).toContain(AnalyticsPlatform.ANDROID);
    expect(taxonomy.groupByDimensions).toContain(AnalyticsGroupBy.EVENT_TYPE);
  });

  it('tracks event with safe default for isPremium', async () => {
    repo.create.mockResolvedValue({ id: 'evt-1' });

    await service.trackEvent({
      eventType: AnalyticsEventType.APP_OPENED,
      userId: 'user-1',
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        eventType: AnalyticsEventType.APP_OPENED,
        isPremium: false,
      }),
    );
  });

  it('preserves an explicit premium flag and all event dimensions', async () => {
    const dto = {
      eventType: AnalyticsEventType.PROFILE_VIEWED,
      userId: 'user-1',
      sessionId: 'session-1',
      deviceId: 'device-1',
      profileId: 'profile-1',
      targetUserId: 'user-2',
      matchId: 'match-1',
      chatId: 'chat-1',
      funnelStage: AnalyticsFunnelStage.AWARENESS,
      source: 'referral',
      medium: 'push',
      campaign: 'summer',
      screen: 'home',
      country: 'IN',
      state: 'DL',
      city: 'Delhi',
      isPremium: true,
      success: true,
      durationMs: 42,
      value: 99,
      appVersion: '1.0.0',
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
      metadata: { placement: 'hero' },
      platform: AnalyticsPlatform.WEB,
    };
    repo.create.mockResolvedValue({ id: 'evt-2' });

    await service.trackEvent(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('returns grouped stats with default topN', async () => {
    repo.aggregate.mockResolvedValue([{ key: 'APP_OPENED', count: 5 }]);

    const result = await service.getStats({
      eventType: AnalyticsEventType.APP_OPENED,
    });

    expect(repo.aggregate).toHaveBeenCalled();
    expect(result.topN).toBe(10);
    expect(result.totalGroups).toBe(1);
  });

  it.each([
    [AnalyticsGroupBy.PLATFORM, '$platform'],
    [AnalyticsGroupBy.SOURCE, '$source'],
    [AnalyticsGroupBy.CAMPAIGN, '$campaign'],
    [AnalyticsGroupBy.COUNTRY, '$country'],
    [AnalyticsGroupBy.CITY, '$city'],
    [AnalyticsGroupBy.FUNNEL_STAGE, '$funnelStage'],
    [AnalyticsGroupBy.EVENT_TYPE, '$eventType'],
  ])('groups stats by %s', async (groupBy, expectedField) => {
    repo.aggregate.mockResolvedValue([]);

    const result = await service.getStats({ groupBy, topN: 3 });

    const pipeline = repo.aggregate.mock.calls[0][0];
    expect(pipeline[1].$group._id).toBe(expectedField);
    expect(result).toEqual({ groupBy, topN: 3, totalGroups: 0, rows: [] });
  });

  it('builds a complete analytics filter with event type precedence', async () => {
    repo.aggregate.mockResolvedValue([]);

    await service.getStats({
      eventType: AnalyticsEventType.APP_OPENED,
      eventTypes: [AnalyticsEventType.PROFILE_VIEWED],
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.999Z',
      platform: AnalyticsPlatform.ANDROID,
      funnelStage: AnalyticsFunnelStage.AWARENESS,
      userId: 'user-1',
      source: 'referral',
      campaign: 'summer',
      country: 'IN',
      city: 'Delhi',
      isPremium: false,
    });

    expect(repo.aggregate.mock.calls[0][0][0].$match).toEqual({
      eventType: AnalyticsEventType.APP_OPENED,
      occurredAt: {
        $gte: new Date('2026-06-01T00:00:00.000Z'),
        $lte: new Date('2026-06-30T23:59:59.999Z'),
      },
      platform: AnalyticsPlatform.ANDROID,
      funnelStage: AnalyticsFunnelStage.AWARENESS,
      userId: 'user-1',
      source: 'referral',
      campaign: 'summer',
      country: 'IN',
      city: 'Delhi',
      isPremium: false,
    });
  });

  it('supports event arrays and one-sided date ranges', async () => {
    repo.aggregate.mockResolvedValue([]);

    await service.getStats({
      eventTypes: [AnalyticsEventType.APP_OPENED],
      from: '2026-06-01T00:00:00.000Z',
    });
    await service.getStats({ to: '2026-06-30T23:59:59.999Z' });

    expect(repo.aggregate.mock.calls[0][0][0].$match).toEqual({
      eventType: { $in: [AnalyticsEventType.APP_OPENED] },
      occurredAt: { $gte: new Date('2026-06-01T00:00:00.000Z') },
    });
    expect(repo.aggregate.mock.calls[1][0][0].$match).toEqual({
      occurredAt: { $lte: new Date('2026-06-30T23:59:59.999Z') },
    });
  });

  it('returns overview totals, dimensions, trend, and safe conversion rates', async () => {
    repo.count
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);
    repo.distinctUsers.mockResolvedValue(['user-1', null, 'user-2']);
    repo.aggregate
      .mockResolvedValueOnce([{ key: 'WEB', count: 20, uniqueUsers: 2 }])
      .mockResolvedValueOnce([{ key: 'APP_OPENED', count: 20, uniqueUsers: 2 }])
      .mockResolvedValueOnce([{ date: '2026-06-30', count: 20 }]);

    const result = await service.getOverview({});

    expect(result).toEqual({
      totals: { totalEvents: 20, uniqueUsers: 2 },
      conversion: {
        impressionToViewRate: 50,
        viewToInterestRate: 0,
        interestToMatchRate: 0,
        matchToChatRate: 40,
      },
      dimensions: {
        byPlatform: [{ key: 'WEB', count: 20, uniqueUsers: 2 }],
        topEvents: [{ key: 'APP_OPENED', count: 20, uniqueUsers: 2 }],
      },
      trend: [{ date: '2026-06-30', count: 20 }],
    });
  });

  it('calculates funnel conversions and removes an event filter from the base match', async () => {
    repo.distinctUsers
      .mockResolvedValueOnce(['a', 'b', null])
      .mockResolvedValueOnce(['a'])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['a'])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await service.getFunnel({
      eventType: AnalyticsEventType.APP_OPENED,
      platform: AnalyticsPlatform.WEB,
    });

    expect(repo.distinctUsers).toHaveBeenCalledTimes(6);
    expect(repo.distinctUsers.mock.calls[0][0]).toEqual({
      platform: AnalyticsPlatform.WEB,
      eventType: AnalyticsEventType.PROFILE_IMPRESSION,
    });
    expect(result.steps[0]).toEqual(
      expect.objectContaining({
        users: 2,
        conversionFromPrevious: 100,
        conversionFromStart: 100,
      }),
    );
    expect(result.steps[2]).toEqual(
      expect.objectContaining({
        users: 0,
        conversionFromPrevious: 0,
        conversionFromStart: 0,
      }),
    );
    expect(result.steps[3].conversionFromPrevious).toBe(0);
  });

  it('returns zero funnel conversions when the funnel has no starting users', async () => {
    repo.distinctUsers.mockResolvedValue([]);

    const result = await service.getFunnel({});

    expect(result.steps.every((step) => step.conversionFromStart === 0)).toBe(
      true,
    );
  });

  it('aggregates and persists a requested daily summary', async () => {
    const overview = { totals: { totalEvents: 1 } };
    const funnel = { steps: [] };
    jest.spyOn(service, 'getOverview').mockResolvedValue(overview as never);
    jest.spyOn(service, 'getFunnel').mockResolvedValue(funnel);
    repo.upsertDailySummary.mockResolvedValue({ day: '2026-06-29' });

    const result = await service.aggregateDailySummary('2026-06-29');

    expect(repo.upsertDailySummary).toHaveBeenCalledWith(
      expect.objectContaining({
        day: '2026-06-29',
        from: new Date('2026-06-29T00:00:00.000Z'),
        to: new Date('2026-06-29T23:59:59.999Z'),
        overview,
        funnel,
        generatedAt: expect.any(Date),
      }),
    );
    expect(result).toEqual({ day: '2026-06-29' });
  });

  it('defaults daily aggregation to the previous UTC day', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T12:00:00.000Z'));
    jest.spyOn(service, 'getOverview').mockResolvedValue({} as never);
    jest.spyOn(service, 'getFunnel').mockResolvedValue({ steps: [] });
    repo.upsertDailySummary.mockResolvedValue({ day: '2026-06-29' });

    await service.aggregateDailySummary();

    expect(repo.upsertDailySummary).toHaveBeenCalledWith(
      expect.objectContaining({ day: '2026-06-29' }),
    );
    jest.useRealTimers();
  });

  it('returns daily summary by specific day when provided', async () => {
    repo.getDailySummaryByDay.mockResolvedValue({ day: '2026-06-25' });

    const result = await service.getDailySummaries({ day: '2026-06-25' });

    expect(repo.getDailySummaryByDay).toHaveBeenCalledWith('2026-06-25');
    expect(repo.getDailySummaries).not.toHaveBeenCalled();
    expect(result).toEqual({
      total: 1,
      summaries: [{ day: '2026-06-25' }],
    });
  });

  it('returns an empty result when a requested daily summary does not exist', async () => {
    repo.getDailySummaryByDay.mockResolvedValue(null);

    await expect(
      service.getDailySummaries({ day: '2026-06-25' }),
    ).resolves.toEqual({ total: 0, summaries: [] });
  });

  it('clamps summary limit and fetches range summaries', async () => {
    repo.getDailySummaries.mockResolvedValue([{ day: '2026-06-24' }]);

    const result = await service.getDailySummaries({
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.999Z',
      limit: 500,
    });

    expect(repo.getDailySummaries).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 90,
      }),
    );
    expect(result.total).toBe(1);
  });

  it('applies the default and minimum summary limits without date filters', async () => {
    repo.getDailySummaries.mockResolvedValue([]);

    await service.getDailySummaries({});
    await service.getDailySummaries({ limit: 0 });

    expect(repo.getDailySummaries).toHaveBeenNthCalledWith(1, {
      from: undefined,
      to: undefined,
      limit: 30,
    });
    expect(repo.getDailySummaries).toHaveBeenNthCalledWith(2, {
      from: undefined,
      to: undefined,
      limit: 1,
    });
  });
});
