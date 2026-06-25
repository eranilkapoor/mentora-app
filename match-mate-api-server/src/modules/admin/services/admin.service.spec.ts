import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Status, SubscriptionStatus } from '@/common/enums';
import { MediaModerationStatus } from '@/modules/profiles/enums/profile-media.enums';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum';
import { BroadcastChannel } from '../enums/broadcast.enums';
import { AdminService } from './admin.service';

const createExecChain = (result: unknown) => {
  const chain = {
    find: jest.fn(),
    findOne: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
  };
  chain.find.mockReturnValue(chain);
  chain.findOne.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  chain.exec.mockResolvedValue(result);
  chain.aggregate.mockReturnValue(chain);
  chain.countDocuments.mockReturnValue(chain);
  return chain;
};

describe('AdminService', () => {
  const repo = {
    findUsers: jest.fn(),
    countUsers: jest.fn(),
    findUserById: jest.fn(),
    updateUserStatus: jest.fn(),
    findUsersForBroadcast: jest.fn(),
  };
  const auditService = {
    write: jest.fn(),
  };
  const analyticsService = {
    getOverview: jest.fn(),
  };
  const notificationsService = {
    notify: jest.fn(),
  };

  const profileModel = createExecChain(null);
  const mediaModel = createExecChain([]);
  const verificationModel = createExecChain(null);
  const reportModel = createExecChain([]);
  const paymentModel = createExecChain([]);
  const subscriptionModel = createExecChain([]);

  let service: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    profileModel.exec.mockResolvedValue({ profileCompletionPercentage: 60 });
    mediaModel.exec.mockResolvedValue([]);
    verificationModel.exec.mockResolvedValue({
      status: VerificationStatus.PENDING,
    });
    reportModel.exec.mockResolvedValue([]);
    paymentModel.exec.mockResolvedValue([]);
    subscriptionModel.exec.mockResolvedValue([]);

    service = new AdminService(
      repo as never,
      auditService as never,
      analyticsService as never,
      notificationsService as never,
      profileModel as never,
      mediaModel as never,
      verificationModel as never,
      reportModel as never,
      paymentModel as never,
      subscriptionModel as never,
    );
  });

  it('lists users with pagination metadata', async () => {
    repo.findUsers.mockResolvedValue([{ _id: 'u1' }]);
    repo.countUsers.mockResolvedValue(1);

    const result = await service.getUsers({
      page: 1,
      limit: 20,
      status: 'active',
    });

    expect(repo.findUsers).toHaveBeenCalled();
    expect(result.meta).toMatchObject({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('returns user detail with risk metadata', async () => {
    const userId = new Types.ObjectId().toString();
    repo.findUserById.mockResolvedValue({
      _id: userId,
      status: Status.BLOCKED,
    });
    paymentModel.exec.mockResolvedValue([{ _id: 'p1' }]);
    subscriptionModel.exec.mockResolvedValue([{ _id: 's1' }]);
    reportModel.exec.mockResolvedValue([{ _id: 'r1' }]);

    const result = await service.getUserById(userId);

    expect(result.risk).toMatchObject({
      reportCount: 1,
      status: Status.BLOCKED,
      isBlocked: true,
    });
    expect(result.payments).toHaveLength(1);
  });

  it('rejects empty status updates', async () => {
    await expect(
      service.updateUserStatus({ userId: 'u1' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('updates user status and writes audit', async () => {
    repo.findUserById.mockResolvedValue({ _id: 'u1', status: Status.ACTIVE });
    repo.updateUserStatus.mockResolvedValue({
      _id: 'u1',
      status: Status.BLOCKED,
    });

    const result = await service.updateUserStatus(
      { userId: 'u1', isBlocked: true, reason: 'abuse' },
      'admin-1',
      { ip: '127.0.0.1' } as never,
    );

    expect(repo.updateUserStatus).toHaveBeenCalledWith('u1', {
      status: Status.BLOCKED,
    });
    expect(auditService.write).toHaveBeenCalled();
    expect(result).toMatchObject({ status: Status.BLOCKED });
  });

  it('broadcasts to matching users and reports failures', async () => {
    repo.findUsersForBroadcast.mockResolvedValue([
      { _id: new Types.ObjectId() },
      { _id: new Types.ObjectId() },
    ]);
    notificationsService.notify
      .mockResolvedValueOnce({ _id: 'n1' })
      .mockRejectedValueOnce(new Error('provider-down'));

    const result = await service.broadcast(
      {
        title: 'Maintenance',
        message: 'Tonight',
        channels: [BroadcastChannel.IN_APP],
      },
      'admin-1',
      { ip: '127.0.0.1' } as never,
    );

    expect(result).toMatchObject({
      targetedUsers: 2,
      failed: 1,
      success: true,
    });
    expect(auditService.write).toHaveBeenCalled();
  });

  it('returns unified moderation queue counts and sorted items', async () => {
    mediaModel.exec.mockResolvedValue([
      {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        moderationStatus: MediaModerationStatus.FLAGGED,
        moderationReasons: ['nudity'],
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
      },
    ]);
    verificationModel.exec.mockResolvedValue([
      {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        status: VerificationStatus.PENDING,
        submittedAt: new Date('2026-06-02T00:00:00.000Z'),
      },
    ]);
    reportModel.exec.mockResolvedValue([
      {
        _id: new Types.ObjectId(),
        reportedUserId: new Types.ObjectId(),
        reason: 'spam',
        createdAt: new Date('2026-06-03T00:00:00.000Z'),
      },
    ]);

    const result = await service.getModerationQueue();

    expect(result.counts).toMatchObject({ media: 1, kyc: 1, reports: 1 });
    expect(result.items).toHaveLength(3);
  });

  it('returns admin dashboard aggregates', async () => {
    analyticsService.getOverview.mockResolvedValue({ dau: 12 });
    repo.countUsers.mockResolvedValue(10);
    paymentModel.exec.mockResolvedValue([
      { _id: 'INR', total: 2500, count: 3 },
    ]);
    subscriptionModel.exec.mockResolvedValue(7);
    mediaModel.exec.mockResolvedValue(4);
    verificationModel.exec.mockResolvedValue(2);
    reportModel.exec.mockResolvedValue(1);

    const result = await service.getDashboard({
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-25T00:00:00.000Z',
    });

    expect(analyticsService.getOverview).toHaveBeenCalled();
    const aggregateCalls = paymentModel.aggregate.mock.calls as unknown[];
    const firstAggregateCall = aggregateCalls[0] as unknown[];
    const pipeline = firstAggregateCall[0] as Array<Record<string, unknown>>;

    expect(Array.isArray(pipeline)).toBe(true);
    expect((pipeline[0]?.$match as Record<string, unknown>)?.status).toBe(
      PaymentStatus.SUCCESS,
    );
    expect(
      typeof (pipeline[0]?.$match as Record<string, unknown>)?.paidAt,
    ).toBe('object');
    expect(pipeline[1]).toEqual({
      $group: {
        _id: '$currency',
        total: { $sum: '$netAmount' },
        count: { $sum: 1 },
      },
    });

    const subscriptionCalls = subscriptionModel.countDocuments.mock
      .calls as unknown[];
    const firstSubscriptionCall = subscriptionCalls[0] as unknown[];
    const subscriptionFilter = firstSubscriptionCall[0] as Record<
      string,
      unknown
    >;
    expect(subscriptionFilter.status).toEqual({
      $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
    });
    expect(
      (subscriptionFilter.endDate as Record<string, unknown>)?.$gt,
    ).toBeInstanceOf(Date);
    expect(result).toMatchObject({
      users: { registeredInRange: 10 },
      subscriptions: { active: 7 },
      moderation: { pendingMedia: 4, pendingKyc: 2, reports: 1 },
    });
  });
});
