import { SuccessCode } from '@/common/constants';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsSummaryQueryDto } from '@/modules/analytics/dto/analytics-summary-query.dto';

describe('AdminAnalyticsController', () => {
  const analyticsService = {
    trackEvent: jest.fn(),
    getStats: jest.fn(),
    getOverview: jest.fn(),
    getFunnel: jest.fn(),
    getEventTaxonomy: jest.fn(),
    getDailySummaries: jest.fn(),
  };

  let controller: AdminAnalyticsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminAnalyticsController(analyticsService as never);
  });

  it('returns taxonomy metadata for analytics clients', () => {
    analyticsService.getEventTaxonomy.mockReturnValue({
      eventTypes: ['PROFILE_VIEWED'],
      platforms: ['web'],
      funnelStages: ['DISCOVERY'],
      groupByDimensions: ['eventType'],
    });

    const response = controller.getTaxonomy();

    expect(analyticsService.getEventTaxonomy).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.ANALYTICS_FETCHED);
  });

  it('returns daily summaries with query filters', async () => {
    analyticsService.getDailySummaries.mockResolvedValue({
      total: 1,
      summaries: [{ day: '2026-06-23' }],
    });

    const query: AnalyticsSummaryQueryDto = {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-23T23:59:59.999Z',
      limit: 14,
    };
    const response = await controller.getDailySummaries(query);

    expect(analyticsService.getDailySummaries).toHaveBeenCalledWith({
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-23T23:59:59.999Z',
      limit: 14,
    });
    expect(response.code).toBe(SuccessCode.ANALYTICS_FETCHED);
  });

  it('tracks analytics events', async () => {
    analyticsService.trackEvent.mockResolvedValue({ id: 'evt-1' });

    const response = await controller.track({
      eventType: 'APP_OPENED',
      platform: 'android',
    } as never);

    expect(analyticsService.trackEvent).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.ANALYTICS_TRACKED);
  });

  it('returns stats, overview, and funnel datasets', async () => {
    analyticsService.getStats.mockResolvedValue({ totalEvents: 20 });
    analyticsService.getOverview.mockResolvedValue({ users: 10 });
    analyticsService.getFunnel.mockResolvedValue({ conversion: 0.25 });

    const query = {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-23T23:59:59.999Z',
    };

    const stats = await controller.getStats(query);
    const overview = await controller.getOverview(query);
    const funnel = await controller.getFunnel(query);

    expect(stats.code).toBe(SuccessCode.ANALYTICS_FETCHED);
    expect(overview.code).toBe(SuccessCode.ANALYTICS_FETCHED);
    expect(funnel.code).toBe(SuccessCode.ANALYTICS_FETCHED);
  });
});
