import { AnalyticsAggregationTask } from './analytics-aggregation.task';

describe('AnalyticsAggregationTask', () => {
  const analyticsService = {
    aggregateDailySummary: jest.fn(),
  };

  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  let task: AnalyticsAggregationTask;

  beforeEach(() => {
    jest.clearAllMocks();
    task = new AnalyticsAggregationTask(
      analyticsService as never,
      logger as never,
    );
  });

  it('logs summary details when aggregation succeeds', async () => {
    analyticsService.aggregateDailySummary.mockResolvedValue({
      day: '2026-06-24',
      generatedAt: new Date('2026-06-25T01:15:00.000Z'),
    });

    await task.aggregateDailySummary();

    expect(logger.log).toHaveBeenCalledWith(
      'Analytics daily aggregation complete',
      expect.objectContaining({ day: '2026-06-24' }),
    );
  });

  it('logs errors when aggregation throws', async () => {
    analyticsService.aggregateDailySummary.mockRejectedValue(
      new Error('aggregation failed'),
    );

    await task.aggregateDailySummary();

    expect(logger.error).toHaveBeenCalledWith(
      'Analytics daily aggregation failed',
      expect.any(String),
      expect.objectContaining({ error: 'aggregation failed' }),
    );
  });
});
