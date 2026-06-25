import { AnalyticsService } from './analytics.service';
import {
  AnalyticsEventType,
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

  it('returns grouped stats with default topN', async () => {
    repo.aggregate.mockResolvedValue([{ key: 'APP_OPENED', count: 5 }]);

    const result = await service.getStats({
      eventType: AnalyticsEventType.APP_OPENED,
    });

    expect(repo.aggregate).toHaveBeenCalled();
    expect(result.topN).toBe(10);
    expect(result.totalGroups).toBe(1);
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
});
