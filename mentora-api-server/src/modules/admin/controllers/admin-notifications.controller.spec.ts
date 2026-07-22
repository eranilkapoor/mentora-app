import { SuccessCode } from '@/common/constants';
import { AdminNotificationsController } from './admin-notifications.controller';

describe('AdminNotificationsController', () => {
  const notificationsService = {
    notify: jest.fn(),
    sendTemplateNotification: jest.fn(),
    listTemplates: jest.fn(),
    upsertTemplate: jest.fn(),
    getAnalytics: jest.fn(),
    listDeadLetterJobs: jest.fn(),
    getDeadLetterJob: jest.fn(),
    replayDeadLetterJob: jest.fn(),
    replayAllDeadLetterJobs: jest.fn(),
    purgeDeadLetterJobs: jest.fn(),
  };

  const auditService = {
    write: jest.fn(),
  };

  let controller: AdminNotificationsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminNotificationsController(
      notificationsService as never,
      auditService as never,
    );
  });

  it('creates direct notification and writes audit', async () => {
    const req = { user: { sub: 'admin-1' } };
    notificationsService.notify.mockResolvedValue({ _id: 'n1' });

    const response = await controller.create(
      req as never,
      {
        userId: 'u1',
        title: 'Title',
        message: 'Body',
        category: 'system',
      } as never,
    );

    expect(notificationsService.notify).toHaveBeenCalled();
    expect(auditService.write).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
  });

  it('dispatches template and writes audit', async () => {
    const req = { user: { sub: 'admin-1' } };
    notificationsService.sendTemplateNotification.mockResolvedValue({
      _id: 'n2',
    });

    const response = await controller.dispatchTemplate(req as never, {
      userId: 'u1',
      templateKey: 'WELCOME',
    });

    expect(notificationsService.sendTemplateNotification).toHaveBeenCalled();
    expect(auditService.write).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
  });

  it('lists templates with includeInactive flag parsing', async () => {
    notificationsService.listTemplates.mockResolvedValue([]);

    await controller.listTemplates('true');

    expect(notificationsService.listTemplates).toHaveBeenCalledWith(true);
  });

  it('upserts template and records audit', async () => {
    const req = { user: { sub: 'admin-1' } };
    notificationsService.upsertTemplate.mockResolvedValue({ key: 'WELCOME' });

    const response = await controller.upsertTemplate(req as never, 'WELCOME', {
      title: 'Welcome',
      message: 'Hi',
      category: 'system',
    } as never);

    expect(notificationsService.upsertTemplate).toHaveBeenCalledWith(
      'WELCOME',
      expect.any(Object),
    );
    expect(auditService.write).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
  });

  it('returns analytics and DLQ data endpoints', async () => {
    notificationsService.getAnalytics.mockResolvedValue({ total: 1 });
    notificationsService.listDeadLetterJobs.mockResolvedValue({ items: [] });
    notificationsService.getDeadLetterJob.mockResolvedValue({ id: 'j1' });

    const analytics = await controller.analytics({ days: 7 });
    const dlq = await controller.listDeadLetterJobs({ page: 1, limit: 10 });
    const one = await controller.getDeadLetterJob('j1');

    expect(analytics.code).toBe(SuccessCode.ANALYTICS_FETCHED);
    expect(dlq.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
    expect(one.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
  });

  it('replays and purges DLQ jobs with audit', async () => {
    const req = { user: { sub: 'admin-1' } };
    notificationsService.replayDeadLetterJob.mockResolvedValue({ ok: true });
    notificationsService.replayAllDeadLetterJobs.mockResolvedValue({
      scheduled: 2,
    });
    notificationsService.purgeDeadLetterJobs.mockResolvedValue({ deleted: 2 });

    const replayOne = await controller.replayDeadLetterJob(req as never, 'j1');
    const replayAll = await controller.replayAllDeadLetterJobs(req as never, {
      limit: 10,
    });
    const purge = await controller.purgeDeadLetterJobs(req as never, {
      limit: 10,
    });

    expect(replayOne.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
    expect(replayAll.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
    expect(purge.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
    expect(auditService.write).toHaveBeenCalledTimes(3);
  });
});
