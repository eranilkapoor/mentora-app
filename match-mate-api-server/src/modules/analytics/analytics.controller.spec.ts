import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

const mockAnalyticsService = () => ({
  trackEvent: jest.fn(),
  getStats: jest.fn(),
  getOverview: jest.fn(),
  getFunnel: jest.fn(),
});

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: ReturnType<typeof mockAnalyticsService>;

  beforeEach(async () => {
    service = mockAnalyticsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: service }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('track()', () => {
    it('should call analyticsService.trackEvent', () => {
      const dto = { event: 'PROFILE_VIEWED', userId: 'user-1' };
      service.trackEvent.mockReturnValue(undefined);
      controller.track(dto as any);
      expect(service.trackEvent).toHaveBeenCalledWith(dto);
    });
  });

  describe('getStats()', () => {
    it('should return analytics stats', () => {
      const stats = { totalEvents: 100, byType: [] };
      service.getStats.mockReturnValue(stats);
      const result = controller.getStats({} as any);
      expect(result).toEqual(stats);
    });
  });

  describe('getOverview()', () => {
    it('should return analytics overview', () => {
      const overview = { totalEvents: 500, uniqueUsers: 50 };
      service.getOverview.mockReturnValue(overview);
      const result = controller.getOverview({} as any);
      expect(result).toEqual(overview);
    });
  });

  describe('getFunnel()', () => {
    it('should return conversion funnel data', () => {
      const funnel = { steps: [], conversionRate: 0.2 };
      service.getFunnel.mockReturnValue(funnel);
      const result = controller.getFunnel({} as any);
      expect(result).toEqual(funnel);
    });
  });
});
