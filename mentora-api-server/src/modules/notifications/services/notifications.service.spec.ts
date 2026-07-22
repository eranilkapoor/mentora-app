/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { FeatureKey, PlanTier } from '@/common/enums';

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
    findByUser: jest.fn(),
    upsertDeviceToken: jest.fn(),
    revokeDeviceToken: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    listTemplates: jest.fn(),
    getDeliveryAnalytics: jest.fn(),
    upsertTemplate: jest.fn(),
    findTemplateByKey: jest.fn(),
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
    getDeadLetter: jest.fn(),
    replayDeadLetter: jest.fn(),
    replayDeadLettersBulk: jest.fn(),
    purgeDeadLetters: jest.fn(),
  };

  const settingsService = {
    getOrCreateUserSettings: jest.fn(),
  };

  const realtime = {
    emitToUser: jest.fn(),
  };
  const freePlanId = new Types.ObjectId();
  const emailFeatureId = new Types.ObjectId();
  const smsFeatureId = new Types.ObjectId();
  const subscriptionModel = {
    findOne: jest.fn(),
  };
  const planModel = {
    findOne: jest.fn(),
  };
  const featureModel = {
    findOne: jest.fn(),
  };
  const planFeatureModel = {
    findOne: jest.fn(),
  };

  type QueryMock<T> = {
    sort: jest.Mock<QueryMock<T>, unknown[]>;
    select: jest.Mock<QueryMock<T>, unknown[]>;
    lean: jest.Mock<QueryMock<T>, unknown[]>;
    exec: jest.Mock<Promise<T>, []>;
  };

  const query = <T>(value: T): QueryMock<T> => {
    const chain = {} as QueryMock<T>;
    chain.sort = jest.fn(() => chain);
    chain.select = jest.fn(() => chain);
    chain.lean = jest.fn(() => chain);
    chain.exec = jest.fn().mockResolvedValue(value);
    return chain;
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
    notificationRepo.findByUser.mockResolvedValue([]);
    notificationRepo.upsertDeviceToken.mockResolvedValue({});
    notificationRepo.revokeDeviceToken.mockResolvedValue({});
    notificationRepo.markAsRead.mockResolvedValue({});
    notificationRepo.markAllAsRead.mockResolvedValue({ modifiedCount: 1 });
    notificationRepo.listTemplates.mockResolvedValue([]);
    notificationRepo.getDeliveryAnalytics.mockResolvedValue({});
    notificationRepo.upsertTemplate.mockResolvedValue({});
    notificationRepo.findTemplateByKey.mockResolvedValue(null);
    queueService.listDeadLetters.mockResolvedValue({ items: [] });
    queueService.getDeadLetter.mockResolvedValue({ id: 'job' });
    queueService.replayDeadLetter.mockResolvedValue({ replayQueued: true });
    queueService.replayDeadLettersBulk.mockResolvedValue({ scheduled: 1 });
    queueService.purgeDeadLetters.mockResolvedValue({ deleted: 1 });
    subscriptionModel.findOne.mockReturnValue(query(null));
    planModel.findOne.mockReturnValue(
      query({ _id: freePlanId, tier: PlanTier.FREE }),
    );
    featureModel.findOne.mockImplementation(({ key }: { key: FeatureKey }) =>
      query({
        _id:
          key === FeatureKey.SMS_NOTIFICATIONS ? smsFeatureId : emailFeatureId,
        key,
      }),
    );
    planFeatureModel.findOne.mockReturnValue(query(null));
    pushProvider.send.mockResolvedValue({ status: 'sent', provider: 'fcm' });
    emailProvider.send.mockResolvedValue({ status: 'sent', provider: 'ses' });
    smsProvider.send.mockResolvedValue({
      status: 'skipped',
      provider: 'msg91',
    });
    const metrics = {
      recordNotificationDelivery: jest.fn(),
    };

    service = new NotificationsService(
      notificationRepo as never,
      emailProvider as never,
      smsProvider as never,
      pushProvider as never,
      queueService as never,
      settingsService as never,
      realtime as never,
      metrics as never,
      subscriptionModel as never,
      planModel as never,
      featureModel as never,
      planFeatureModel as never,
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

  it('sends security email without persistence, queue, or realtime delivery', async () => {
    await expect(
      service.sendSecurityEmail({
        userId,
        subject: 'Reset password',
        message: 'Secret link',
        html: '<p>Secret link</p>',
        templateKey: 'auth.password_reset',
      }),
    ).resolves.toEqual({ status: 'sent', provider: 'ses' });

    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        to: 'user@test.com',
        message: '<p>Secret link</p>',
        templateKey: 'auth.password_reset',
      }),
    );
    expect(notificationRepo.create).not.toHaveBeenCalled();
    expect(queueService.enqueueDispatch).not.toHaveBeenCalled();
    expect(realtime.emitToUser).not.toHaveBeenCalled();
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

  it('keeps system and subscription emails default-on but gates engagement email and SMS by plan feature', async () => {
    settingsService.getOrCreateUserSettings.mockResolvedValue({
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: true,
      preferences: {
        system: { inApp: true, push: true, email: true, sms: false },
        subscription: { inApp: true, push: true, email: true, sms: false },
        sessionScheduled: { inApp: true, push: true, email: true, sms: true },
      },
    });

    await service.notify({
      userId,
      title: 'System alert',
      message: 'System alert',
      category: 'system',
      channels: ['email'],
    });
    await service.notify({
      userId,
      title: 'Subscription update',
      message: 'Subscription update',
      category: 'subscription',
      channels: ['email'],
    });
    await service.notify({
      userId,
      title: 'Session scheduled',
      message: 'Session scheduled',
      category: 'session_scheduled',
      channels: ['email', 'sms'],
    });

    expect(emailProvider.send).toHaveBeenCalledTimes(2);
    expect(planFeatureModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: freePlanId,
        featureId: emailFeatureId,
        isActive: true,
      }),
    );
    expect(planFeatureModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: freePlanId,
        featureId: smsFeatureId,
        isActive: true,
      }),
    );
    expect(smsProvider.send).not.toHaveBeenCalled();

    emailProvider.send.mockClear();
    smsProvider.send.mockClear();
    planFeatureModel.findOne.mockReturnValue(query({ value: true }));
    smsProvider.send.mockResolvedValue({ status: 'sent', provider: 'msg91' });

    await service.notify({
      userId,
      title: 'Session scheduled',
      message: 'Session scheduled',
      category: 'session_scheduled',
      channels: ['email', 'sms'],
    });

    expect(emailProvider.send).toHaveBeenCalledTimes(1);
    expect(smsProvider.send).toHaveBeenCalledTimes(1);
  });

  it('routes transactional notifications to the verified contact channel available to free users', async () => {
    settingsService.getOrCreateUserSettings.mockResolvedValue({
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      preferences: {
        system: { inApp: true, push: true, email: true, sms: false },
        subscription: { inApp: true, push: true, email: true, sms: false },
      },
    });
    smsProvider.send.mockResolvedValue({ status: 'sent', provider: 'msg91' });

    notificationRepo.findUserById.mockResolvedValue({
      email: undefined,
      isEmailVerified: false,
      isPhoneVerified: true,
      phone: { countryCode: '+91', phone: '9999999999' },
    });

    await service.notify({
      userId,
      title: 'Security alert',
      message: 'Security alert',
      category: 'system',
      channels: ['email'],
    });

    expect(emailProvider.send).not.toHaveBeenCalled();
    expect(smsProvider.send).toHaveBeenCalledTimes(1);

    emailProvider.send.mockClear();
    smsProvider.send.mockClear();
    notificationRepo.findUserById.mockResolvedValue({
      email: 'user@test.com',
      isEmailVerified: true,
      isPhoneVerified: false,
      phone: undefined,
    });

    await service.notify({
      userId,
      title: 'Subscription update',
      message: 'Subscription update',
      category: 'subscription',
      channels: ['sms'],
    });

    expect(emailProvider.send).toHaveBeenCalledTimes(1);
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

    pushProvider.send.mockResolvedValue({ status: 'sent', provider: 'fcm' });
    await expect(
      service.processDispatchJob({
        notificationId: new Types.ObjectId().toString(),
        userId,
        title: 'Test',
        message: 'Test',
        subject: 'Test',
        decision: {
          inApp: true,
          push: false,
          email: false,
          sms: false,
        },
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects DLQ listing when queue is disabled', async () => {
    queueService.isEnabled.mockReturnValue(false);
    queueService.listDeadLetters.mockResolvedValue({ items: [] });
    queueService.getDeadLetter.mockResolvedValue({ id: 'job' });
    queueService.replayDeadLetter.mockResolvedValue({ replayQueued: true });
    queueService.replayDeadLettersBulk.mockResolvedValue({ scheduled: 1 });
    queueService.purgeDeadLetters.mockResolvedValue({ deleted: 1 });

    await expect(
      service.listDeadLetterJobs({ page: 1, limit: 10 }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('delegates template notifications and rejects unknown users', async () => {
    const templateSpy = jest
      .spyOn(service, 'sendTemplateNotification')
      .mockResolvedValue({ templated: true } as never);
    await expect(
      service.notify({
        userId,
        title: 'Ignored',
        message: 'Ignored',
        templateKey: 'welcome',
        variables: { name: 'Asha' },
      }),
    ).resolves.toEqual({ templated: true });
    expect(templateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ templateKey: 'welcome' }),
    );
    templateSpy.mockRestore();

    notificationRepo.findUserById.mockResolvedValue(null);
    await expect(
      service.notify({
        userId,
        title: 'Title',
        message: 'Body',
        category: 'system',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.USER_NOT_FOUND });
  });

  it('creates direct notifications with defaults, actor/action metadata, and no phone', async () => {
    notificationRepo.findUserById.mockResolvedValue({ email: 'user@test.com' });
    const created = { _id: new Types.ObjectId() };
    notificationRepo.create.mockResolvedValue(created);
    await expect(
      service.notify({
        userId,
        title: 'Title',
        message: 'Body',
        category: 'system',
        actorId: new Types.ObjectId().toString(),
        action: { screen: 'Home' },
      }),
    ).resolves.toBe(created);
    expect(notificationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info', priority: 'normal' }),
    );
    expect(realtime.emitToUser).toHaveBeenCalledWith(
      userId,
      'notification:unread-count',
      { unreadCount: 2 },
    );

    await service.notify({
      userId,
      title: 'Dedupe window',
      message: 'Body',
      category: 'system',
      dedupeKey: 'window',
      metadata: { dedupeWindowSeconds: 30 },
    });
  });

  it('forwards list, unread, token, read, template, and analytics operations', async () => {
    service.getUserNotifications(userId, {});
    expect(notificationRepo.findByUser).toHaveBeenCalledWith(userId, {
      page: 1,
      limit: 20,
      unreadOnly: undefined,
      category: undefined,
      type: undefined,
    });
    service.getUnreadCount(userId);
    service.registerDeviceToken(userId, {
      deviceId: 'device',
      token: 'token',
      platform: 'android',
    });
    expect(() => service.revokeDeviceToken(userId, {})).toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_REQUEST }),
    );
    service.revokeDeviceToken(userId, { token: 'token' });
    service.revokeDeviceToken(userId, { deviceId: 'device' });
    await service.markRead(userId, new Types.ObjectId().toString());
    await service.markAllRead(userId);
    service.listTemplates();
    service.listTemplates(true);
    service.getAnalytics({});
    service.getAnalytics({ days: 7, channel: 'push', templateKey: 'WELCOME' });
    expect(notificationRepo.getDeliveryAnalytics).toHaveBeenLastCalledWith({
      days: 7,
      channel: 'push',
      templateKey: 'WELCOME',
    });
  });

  it('administers DLQ jobs with defaults and not-found handling', async () => {
    queueService.isEnabled.mockReturnValue(true);
    await service.listDeadLetterJobs({});
    expect(queueService.listDeadLetters).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      state: undefined,
    });
    queueService.getDeadLetter.mockResolvedValue(null);
    await expect(service.getDeadLetterJob('missing')).rejects.toMatchObject({
      code: ErrorCode.NOTIFICATION_NOT_FOUND,
    });
    queueService.getDeadLetter.mockResolvedValue({ id: 'job' });
    await expect(service.getDeadLetterJob('job')).resolves.toEqual({
      id: 'job',
    });
    queueService.replayDeadLetter.mockResolvedValue(null);
    await expect(service.replayDeadLetterJob('missing')).rejects.toMatchObject({
      code: ErrorCode.NOTIFICATION_NOT_FOUND,
    });
    queueService.replayDeadLetter.mockResolvedValue({ replayQueued: true });
    await service.replayDeadLetterJob('job', 'admin');
    await service.replayAllDeadLetterJobs({}, 'admin');
    expect(queueService.replayDeadLettersBulk).toHaveBeenCalledWith({
      state: undefined,
      limit: 100,
      olderThanDays: undefined,
      intervalMs: 200,
      replayedBy: 'admin',
    });
    await service.replayAllDeadLetterJobs({ limit: 5, intervalMs: 10 });
    await service.purgeDeadLetterJobs({});
    expect(queueService.purgeDeadLetters).toHaveBeenCalledWith({
      state: undefined,
      limit: 500,
      olderThanDays: undefined,
    });
    await service.purgeDeadLetterJobs({
      limit: 5,
      state: 'failed',
      olderThanDays: 2,
    });
  });

  it('upserts normalized templates with default and explicit fields', () => {
    service.upsertTemplate(' welcome ', {
      name: 'Welcome',
      title: 'Title',
      message: 'Body',
      category: 'system',
    });
    expect(notificationRepo.upsertTemplate).toHaveBeenCalledWith(
      'WELCOME',
      expect.objectContaining({
        channels: { inApp: true, push: true, email: false, sms: false },
        variables: [],
        isActive: true,
      }),
    );
    service.upsertTemplate('custom', {
      name: 'Custom',
      title: 'Title',
      message: 'Body',
      category: 'system',
      channels: { inApp: false, push: false, email: true, sms: true },
      variables: ['name'],
      isActive: false,
    });
  });

  it('rejects missing/inactive templates and missing template users', async () => {
    await expect(
      service.sendTemplateNotification({ userId, templateKey: 'missing' }),
    ).rejects.toMatchObject({ code: ErrorCode.NOTIFICATION_NOT_FOUND });
    notificationRepo.findTemplateByKey.mockResolvedValue({ isActive: false });
    await expect(
      service.sendTemplateNotification({ userId, templateKey: 'inactive' }),
    ).rejects.toMatchObject({ code: ErrorCode.NOTIFICATION_NOT_FOUND });
    notificationRepo.findTemplateByKey.mockResolvedValue({ isActive: true });
    notificationRepo.findUserById.mockResolvedValue(null);
    await expect(
      service.sendTemplateNotification({ userId, templateKey: 'welcome' }),
    ).rejects.toMatchObject({ code: ErrorCode.USER_NOT_FOUND });
  });

  it('renders and sends templates with custom and fallback channel content', async () => {
    const template = {
      key: 'WELCOME',
      isActive: true,
      title: 'Hello {{name}}',
      message: 'Count {{count}} {{missing}}',
      pushTitle: 'Push {{name}}',
      pushBody: 'Push body',
      emailSubject: 'Email {{name}}',
      emailBody: 'Email body',
      smsBody: 'SMS {{count}}',
      category: 'session_scheduled',
      priority: 'high',
      channels: { inApp: true, push: true, email: true, sms: true },
    };
    notificationRepo.findTemplateByKey.mockResolvedValue(template);
    const created = { _id: new Types.ObjectId() };
    notificationRepo.create.mockResolvedValue(created);
    settingsService.getOrCreateUserSettings.mockResolvedValue({
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: true,
      preferences: {
        sessionScheduled: { inApp: true, push: true, email: true, sms: true },
      },
    });
    await expect(
      service.sendTemplateNotification({
        userId,
        templateKey: ' welcome ',
        variables: { name: 'Asha', count: 2 },
        actorId: new Types.ObjectId().toString(),
        metadata: { source: 'test' },
      }),
    ).resolves.toBe(created);
    expect(notificationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Hello Asha', message: 'Count 2 ' }),
    );

    notificationRepo.findTemplateByKey.mockResolvedValue({
      ...template,
      pushTitle: undefined,
      pushBody: undefined,
      emailSubject: undefined,
      emailBody: undefined,
      smsBody: undefined,
      category: 'system',
      priority: 'normal',
    });
    notificationRepo.findUserById.mockResolvedValue({ email: 'user@test.com' });
    await service.sendTemplateNotification({ userId, templateKey: 'welcome' });
  });

  it('dispatches skipped/already-sent/sent/failed channels and retries', async () => {
    const privateService = service as any;
    const notificationId = new Types.ObjectId().toString();
    notificationRepo.findById.mockResolvedValue({
      isSentPush: true,
      isSentEmail: false,
      isSentSms: false,
      delivery: { prior: true },
    });
    emailProvider.send.mockResolvedValue({ status: 'sent', provider: 'ses' });
    smsProvider.send.mockResolvedValue({
      status: 'failed',
      provider: 'msg91',
      error: 'failed',
    });
    const result = await privateService.dispatchAcrossChannels(
      {
        notificationId,
        userId,
        title: 'Title',
        message: 'Body',
        subject: 'Subject',
        emailBody: 'Email body',
        smsBody: 'SMS body',
        decision: { inApp: true, push: true, email: true, sms: true },
      },
      0,
    );
    expect(result).toEqual({
      hasDeliveryFailure: true,
      failedChannels: ['sms'],
    });
    expect(pushProvider.send).not.toHaveBeenCalled();
    expect(notificationRepo.updateDeliveryStatus).toHaveBeenCalledWith(
      notificationId,
      expect.objectContaining({
        isSentPush: true,
        isSentEmail: true,
        isSentSms: false,
      }),
    );

    (privateService.channelProviders as unknown[]) = [];
    notificationRepo.findById.mockResolvedValue(null);
    await privateService.dispatchAcrossChannels({
      notificationId,
      userId,
      title: 'Title',
      message: 'Body',
      subject: 'Subject',
      decision: { inApp: true, push: false, email: false, sms: false },
    });
  });

  it('resolves channel preferences, DND windows, categories, types, and rendering', () => {
    const privateService = service as any;
    const openSettings = {
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: true,
      preferences: {
        system: { inApp: true, push: true, email: true, sms: true },
      },
    };
    expect(
      privateService.resolveDeliveryDecision('system', openSettings),
    ).toEqual({
      inApp: true,
      push: true,
      email: true,
      sms: true,
    });
    expect(
      privateService.resolveDeliveryDecision(
        'system',
        {
          doNotDisturb: true,
          inAppEnabled: false,
          pushEnabled: false,
          emailEnabled: false,
          smsEnabled: false,
          preferences: {
            system: { inApp: false, push: false, email: false, sms: false },
          },
        },
        ['push'],
        'normal',
        { inApp: false, push: false, email: false, sms: false },
      ),
    ).toEqual({ inApp: false, push: false, email: false, sms: false });
    privateService.resolveDeliveryDecision(
      'system',
      openSettings,
      ['in_app', 'push', 'email', 'sms'],
      'normal',
      { inApp: true, push: true, email: true, sms: true },
    );
    expect(
      privateService.resolveDeliveryDecision(
        'system',
        { ...openSettings, doNotDisturb: true },
        undefined,
        'critical',
      ),
    ).toEqual({ inApp: true, push: true, email: true, sms: true });

    expect(privateService.isInDndWindow({})).toBe(false);
    expect(privateService.isInDndWindow({ doNotDisturb: true })).toBe(true);
    expect(
      privateService.isInDndWindow({ quietHours: { enabled: true } }),
    ).toBe(true);
    expect(
      privateService.isInDndWindow({
        quietHours: { enabled: true, start: 'bad', end: '20:00' },
      }),
    ).toBe(false);
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    expect(
      privateService.isInDndWindow({
        quietHours: { enabled: true, start: hhmm, end: hhmm },
      }),
    ).toBe(true);
    privateService.isInDndWindow({
      quietHours: { enabled: true, start: '23:59', end: '00:00' },
    });

    for (const value of ['bad', '24:00', '12:60', '-1:00']) {
      expect(privateService.toMinutes(value)).toBeNull();
    }
    expect(privateService.toMinutes('01:30')).toBe(90);
    for (const category of [
      'session_scheduled',
      'session_reminder',
      'progress_update',
      'parent_alert',
      'message_received',
      'subscription',
      'system',
    ]) {
      expect(privateService.preferenceKeyFromCategory(category)).toEqual(
        expect.any(String),
      );
      expect(privateService.typeFromCategory(category)).toEqual(
        expect.any(String),
      );
    }
    expect(
      privateService.render('{{missing}} {{nil}} {{ok}}', {
        nil: null,
        ok: true,
      }),
    ).toBe('  true');
  });
});
