import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';

describe('NotificationsService', () => {
  const userId = new Types.ObjectId().toString();

  const notificationRepo = {
    findRecentByDedupeKey: jest.fn(),
    findUserById: jest.fn(),
    create: jest.fn(),
    countUnread: jest.fn(),
    findById: jest.fn(),
    createDeliveryLog: jest.fn(),
    updateDeliveryLog: jest.fn(),
    updateDeliveryStatus: jest.fn(),
  };

  const emailProvider = {
    channel: 'email' as const,
    send: jest.fn(),
  };
  const smsProvider = {
    channel: 'sms' as const,
    send: jest.fn(),
  };
  const pushProvider = {
    channel: 'push' as const,
    send: jest.fn(),
  };

  const queueService = {
    isEnabled: jest.fn(),
    enqueueDispatch: jest.fn(),
    listDeadLetters: jest.fn(),
  };

  const settingsService = {
    getOrCreateUserSettings: jest.fn(),
  };

  const realtime = {
    emitToUser: jest.fn(),
  };

  let service: NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    queueService.isEnabled.mockReturnValue(false);
    notificationRepo.findRecentByDedupeKey.mockResolvedValue(null);
    notificationRepo.findUserById.mockResolvedValue({
      _id: userId,
      email: 'user@test.com',
      phone: { countryCode: '+91', phone: '9999999999' },
    });
    settingsService.getOrCreateUserSettings.mockResolvedValue({
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      preferences: {
        system: { inApp: true, push: true, email: true, sms: false },
      },
    });
    notificationRepo.create.mockResolvedValue({ _id: new Types.ObjectId() });
    notificationRepo.countUnread.mockResolvedValue(2);
    notificationRepo.findById.mockResolvedValue({});
    notificationRepo.createDeliveryLog.mockResolvedValue({
      _id: new Types.ObjectId(),
    });
    notificationRepo.updateDeliveryLog.mockResolvedValue({});
    notificationRepo.updateDeliveryStatus.mockResolvedValue({});
    pushProvider.send.mockResolvedValue({ status: 'sent', provider: 'fcm' });
    emailProvider.send.mockResolvedValue({ status: 'sent', provider: 'ses' });
    smsProvider.send.mockResolvedValue({
      status: 'skipped',
      provider: 'msg91',
    });

    service = new NotificationsService(
      notificationRepo as never,
      emailProvider as never,
      smsProvider as never,
      pushProvider as never,
      queueService as never,
      settingsService as never,
      realtime as never,
    );
  });

  it('rejects notify when category is missing for non-template notifications', async () => {
    const dto: CreateNotificationDto = {
      userId,
      title: 'Hello',
      message: 'World',
    };

    await expect(service.notify(dto)).rejects.toMatchObject({
      code: ErrorCode.INVALID_REQUEST,
    });
  });

  it('returns recent duplicate notification for matching dedupe key', async () => {
    const duplicate = { _id: 'duplicate-1' };
    notificationRepo.findRecentByDedupeKey.mockResolvedValue(duplicate);

    const dto: CreateNotificationDto = {
      userId,
      title: 'Duplicate',
      message: 'Duplicate',
      category: 'system',
      dedupeKey: 'same-key',
    };

    const result = await service.notify(dto);

    expect(result).toBe(duplicate);
    expect(notificationRepo.findUserById).not.toHaveBeenCalled();
  });

  it('enqueues dispatch instead of direct provider send when queue is enabled', async () => {
    queueService.isEnabled.mockReturnValue(true);

    const dto: CreateNotificationDto = {
      userId,
      title: 'Queued',
      message: 'Queued',
      category: 'system',
      channels: ['push'],
    };

    await service.notify(dto);

    expect(queueService.enqueueDispatch).toHaveBeenCalled();
    expect(pushProvider.send).not.toHaveBeenCalled();
    expect(emailProvider.send).not.toHaveBeenCalled();
    expect(smsProvider.send).not.toHaveBeenCalled();
  });

  it('throws from processDispatchJob when a channel fails delivery', async () => {
    pushProvider.send.mockResolvedValue({
      status: 'failed',
      provider: 'fcm',
      error: 'push_failed',
    });

    await expect(
      service.processDispatchJob({
        notificationId: new Types.ObjectId().toString(),
        userId,
        title: 'Test',
        message: 'Test',
        subject: 'Test',
        decision: {
          inApp: true,
          push: true,
          email: false,
          sms: false,
        },
      }),
    ).rejects.toThrow('Notification delivery failed for channels: push');
  });

  it('rejects DLQ listing when queue is disabled', async () => {
    queueService.isEnabled.mockReturnValue(false);

    await expect(
      service.listDeadLetterJobs({ page: 1, limit: 10 }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });
});
