import { OperationalMetricsService } from './operational-metrics.service';

describe('OperationalMetricsService', () => {
  it('records socket, product, notification, and Mongo slow-query metrics', () => {
    const service = new OperationalMetricsService();

    service.recordSocketConnected('chats');
    service.recordSocketConnected('chats');
    service.recordSocketEvent('chats', 'message:send');
    service.recordSocketAuthFailure('chats');
    service.recordSocketDisconnected('chats');
    service.recordNotificationDelivery('sent');
    service.recordNotificationDelivery('failed');
    service.recordNotificationDelivery('skipped');
    service.recordLearningReminder({ eligible: 3, sent: 2, errors: 1 });
    service.recordMongoSlowQuery({
      collection: 'profiles',
      commandName: 'find',
      durationMs: 250,
      recordedAt: '2026-07-22T00:00:00.000Z',
    });

    expect(service.snapshot()).toMatchObject({
      service: 'mentora-api',
      product: {
        learningReminderEligible: 3,
        learningReminderSent: 2,
        learningReminderErrors: 1,
        notificationDeliverySent: 1,
        notificationDeliveryFailures: 1,
        notificationDeliverySkipped: 1,
      },
      sockets: {
        chats: {
          connected: 1,
          connections: 2,
          disconnects: 1,
          authFailures: 1,
          events: { 'message:send': 1 },
        },
      },
      database: {
        mongoSlowQueryCount: 1,
        recentMongoSlowQueries: [
          {
            collection: 'profiles',
            commandName: 'find',
            durationMs: 250,
          },
        ],
      },
    });
  });
});
