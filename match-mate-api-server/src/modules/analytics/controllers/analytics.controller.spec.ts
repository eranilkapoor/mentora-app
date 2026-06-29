import { SuccessCode } from '@/common/constants';
import { AnalyticsController } from './analytics.controller';
import {
  AnalyticsEventType,
  AnalyticsPlatform,
} from '../enums/analytics-event.enum';

describe('AnalyticsController', () => {
  const analyticsService = {
    trackEvent: jest.fn(),
  };

  let controller: AnalyticsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AnalyticsController(analyticsService as never);
  });

  it('binds tracked event user to authenticated request user', async () => {
    analyticsService.trackEvent.mockResolvedValue({ id: 'evt-1' });

    const req = {
      user: { sub: 'auth-user-1' },
      ip: '10.1.0.2',
      headers: {
        'x-platform': 'android',
        'user-agent': 'matchmate-mobile/1.0',
      },
    } as never;

    const response = await controller.track(req, {
      userId: 'spoofed-user-id',
      eventType: AnalyticsEventType.APP_OPENED,
      platform: AnalyticsPlatform.ANDROID,
    });

    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'auth-user-1',
        ipAddress: '10.1.0.2',
        userAgent: 'matchmate-mobile/1.0',
        eventType: AnalyticsEventType.APP_OPENED,
      }),
    );
    expect(response.code).toBe(SuccessCode.ANALYTICS_TRACKED);
  });

  it('normalizes array headers and uses their first values', async () => {
    analyticsService.trackEvent.mockResolvedValue({ id: 'evt-2' });

    await controller.track(
      {
        user: { sub: 'auth-user-2' },
        headers: {
          'x-platform': ['WEB'],
          'user-agent': ['browser-agent'],
        },
      } as never,
      {
        eventType: AnalyticsEventType.APP_OPENED,
      },
    );

    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: 'web',
        userAgent: 'browser-agent',
      }),
    );
  });

  it('preserves an explicit platform when headers are unavailable', async () => {
    analyticsService.trackEvent.mockResolvedValue({ id: 'evt-3' });

    await controller.track(
      {
        user: { sub: 'auth-user-3' },
        headers: {},
      } as never,
      {
        eventType: AnalyticsEventType.APP_OPENED,
        platform: AnalyticsPlatform.IOS,
      },
    );

    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: AnalyticsPlatform.IOS,
        userAgent: undefined,
      }),
    );
  });

  it('handles an empty platform header array', async () => {
    analyticsService.trackEvent.mockResolvedValue({ id: 'evt-4' });

    await controller.track(
      {
        user: { sub: 'auth-user-4' },
        headers: { 'x-platform': [] },
      } as never,
      { eventType: AnalyticsEventType.APP_OPENED },
    );

    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ platform: '' }),
    );
  });
});
