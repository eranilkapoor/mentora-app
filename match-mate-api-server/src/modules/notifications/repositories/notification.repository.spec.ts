/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-argument */
import { Types } from 'mongoose';
import { NotificationRepository } from './notification.repository';

const userId = new Types.ObjectId().toString();
const notificationId = new Types.ObjectId().toString();

const fluent = (value: unknown = []) => {
  const query: Record<string, jest.Mock> = {};
  for (const method of ['lean', 'sort', 'skip', 'limit', 'select']) {
    query[method] = jest.fn(() => query);
  }
  query.then = jest.fn((resolve) => Promise.resolve(value).then(resolve));
  return query;
};

describe('NotificationRepository', () => {
  const notificationQuery = fluent([{ id: 'n1' }]);
  const templateQuery = fluent([]);
  const tokenQuery = fluent([]);
  const userQuery = fluent({ id: userId });
  const notificationModel = {
    create: jest.fn(),
    findById: jest.fn(() => notificationQuery),
    findOne: jest.fn(() => notificationQuery),
    find: jest.fn(() => notificationQuery),
    countDocuments: jest.fn().mockResolvedValue(0),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  const templateModel = {
    findOne: jest.fn(() => templateQuery),
    find: jest.fn(() => templateQuery),
    findOneAndUpdate: jest.fn(),
  };
  const logModel = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    aggregate: jest.fn(),
  };
  const tokenModel = {
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    find: jest.fn(() => tokenQuery),
  };
  const userModel = { findById: jest.fn(() => userQuery) };
  let repository: NotificationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationModel.countDocuments.mockResolvedValue(0);
    repository = new NotificationRepository(
      notificationModel as never,
      templateModel as never,
      logModel as never,
      tokenModel as never,
      userModel as never,
    );
  });

  it('delegates basic notification CRUD and delivery state operations', async () => {
    repository.create({});
    await repository.findById(notificationId);
    await repository.findRecentByDedupeKey(userId, 'dedupe', new Date());
    repository.countUnread(userId);
    repository.markAsRead(notificationId);
    repository.markAsRead(notificationId, userId);
    repository.markAllAsRead(userId);
    repository.updateDeliveryStatus(notificationId, { isSentPush: true });
    expect(notificationModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
  });

  it('normalizes pagination and optional user-list filters', async () => {
    notificationModel.countDocuments
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(250);
    await expect(
      repository.findByUser(userId, { page: 0, limit: 0 }),
    ).resolves.toMatchObject({
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
    await expect(
      repository.findByUser(userId, {
        page: 2,
        limit: 500,
        unreadOnly: true,
        category: 'match',
        type: 'interest',
      }),
    ).resolves.toMatchObject({
      page: 2,
      limit: 100,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  it('delegates templates, logs, users, and device-token lifecycle', async () => {
    await repository.findTemplateByKey('WELCOME');
    await repository.listTemplates();
    await repository.listTemplates(true);
    repository.upsertTemplate('WELCOME', { title: 'Welcome' });
    repository.createDeliveryLog({ status: 'pending' });
    repository.updateDeliveryLog('log-1', {
      status: 'sent',
    });
    await repository.findUserById(userId);
    repository.upsertDeviceToken({
      userId,
      deviceId: 'device',
      token: 'token',
      platform: 'android',
    });
    repository.revokeDeviceToken(userId, {});
    repository.revokeDeviceToken(userId, {
      token: 'token',
      deviceId: 'device',
    });
    expect(templateModel.find).toHaveBeenCalledTimes(2);
    expect(tokenModel.updateMany).toHaveBeenCalledTimes(2);
  });

  it('returns unique non-empty active push tokens', async () => {
    tokenQuery.then.mockImplementationOnce((resolve) =>
      Promise.resolve([
        { token: 'a' },
        { token: 'a' },
        { token: '' },
        { token: 'b' },
      ]).then(resolve),
    );
    await expect(repository.findActivePushTokens(userId)).resolves.toEqual([
      'a',
      'b',
    ]);
  });

  it('returns zeroed delivery analytics without matching logs', async () => {
    logModel.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await expect(
      repository.getDeliveryAnalytics({ days: 7 }),
    ).resolves.toMatchObject({
      window: { days: 7, channel: null, templateKey: null },
      overall: {
        total: 0,
        sent: 0,
        failed: 0,
        successRate: 0,
        failureRate: 0,
      },
      byChannel: [],
      byTemplate: [],
      trend: [],
    });
  });

  it('reshapes filtered delivery analytics and merges repeated groups', async () => {
    logModel.aggregate
      .mockResolvedValueOnce([
        { total: 4, sent: 3, failed: 1, skipped: 0, pending: 0 },
      ])
      .mockResolvedValueOnce([
        { _id: { channel: 'push', status: 'sent' }, count: 3 },
        { _id: { channel: 'push', status: 'failed' }, count: 1 },
      ])
      .mockResolvedValueOnce([
        { _id: { templateKey: 'WELCOME', status: 'sent' }, count: 3 },
        { _id: { templateKey: 'WELCOME', status: 'failed' }, count: 1 },
      ])
      .mockResolvedValueOnce([
        { _id: { day: '2026-06-30', status: 'sent' }, count: 3 },
        { _id: { day: '2026-06-30', status: 'failed' }, count: 1 },
      ]);

    const result = await repository.getDeliveryAnalytics({
      days: 30,
      channel: 'push',
      templateKey: ' welcome ',
    });

    expect(result.overall).toMatchObject({
      successRate: 0.75,
      failureRate: 0.25,
    });
    expect(result.byChannel).toEqual([
      { channel: 'push', total: 4, sent: 3, failed: 1, skipped: 0, pending: 0 },
    ]);
    expect(result.byTemplate[0].total).toBe(4);
    expect(result.trend[0].total).toBe(4);
  });
});
