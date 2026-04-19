import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsEventType, AnalyticsGroupBy } from './enums/analytics-event.enum';

const mockRepo = () => ({
  create: jest.fn(),
  aggregate: jest.fn(),
  count: jest.fn(),
  distinctUsers: jest.fn(),
});

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: AnalyticsRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('trackEvent should default isPremium to false', async () => {
    repo.create.mockResolvedValue({ _id: 'evt-1' });

    await service.trackEvent({
      userId: 'user-1',
      eventType: AnalyticsEventType.PROFILE_VIEWED,
    } as any);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', isPremium: false }),
    );
  });

  it('getStats should return grouped rows', async () => {
    repo.aggregate.mockResolvedValue([
      { key: 'PROFILE_VIEWED', count: 10, uniqueUsers: 7 },
    ]);

    const result = await service.getStats({
      groupBy: AnalyticsGroupBy.EVENT_TYPE,
      topN: 5,
    } as any);

    expect(result).toEqual({
      groupBy: AnalyticsGroupBy.EVENT_TYPE,
      topN: 5,
      totalGroups: 1,
      rows: [{ key: 'PROFILE_VIEWED', count: 10, uniqueUsers: 7 }],
    });
  });

  it('getFunnel should compute conversion percentages', async () => {
    repo.distinctUsers
      .mockResolvedValueOnce(['u1', 'u2', 'u3'])
      .mockResolvedValueOnce(['u1', 'u2'])
      .mockResolvedValueOnce(['u1'])
      .mockResolvedValueOnce(['u1'])
      .mockResolvedValueOnce(['u1'])
      .mockResolvedValueOnce([]);

    const result = await service.getFunnel({} as any);
    expect(result.steps[0].users).toBe(3);
    expect(result.steps[1].conversionFromPrevious).toBeCloseTo(66.67, 1);
    expect(result.steps[5].users).toBe(0);
  });
});
