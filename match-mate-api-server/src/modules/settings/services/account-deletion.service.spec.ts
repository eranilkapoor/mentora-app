/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { AppLogger } from '@/common/logger/logger.service';
import { MediaType, ProfileStatus, Status } from '@/common/enums';
import type { UserDocument } from '@/modules/auth/schemas/user.schema';
import type { UserSessionDocument } from '@/modules/auth/schemas/user-session.schema';
import { MediaStatus } from '@/modules/profiles/enums/profile-media.enums';
import type { MediaDocument } from '@/modules/profiles/schemas/media/media.schema';
import type { PreferenceDocument } from '@/modules/profiles/schemas/preference/preference.schema';
import type { ProfileDocument } from '@/modules/profiles/schemas/profile/profile.schema';
import type { StorageService } from '@/modules/storage/services/storage.service';
import type { AccountSettingDocument } from '../schemas/account-setting.schema';
import { AccountDeletionService } from './account-deletion.service';
import type { PaymentDocument } from '@/modules/payments/schemas/payment.schema';
import type { PaymentInvoiceDocument } from '@/modules/payments/schemas/payment-invoice.schema';
import type { SubscriptionDocument } from '@/modules/subscriptions/schemas/subscription.schema';
import type { VerificationDocument } from '@/modules/safety/schemas/verification.schema';
import type { UserReportDocument } from '@/modules/safety/schemas/user-report.schema';
import type { AdminAuditLogDocument } from '@/modules/admin/schemas/admin-audit-log.schema';

const executable = (result: unknown = undefined) => ({
  exec: jest.fn().mockResolvedValue(result),
});

describe('AccountDeletionService', () => {
  const accountFindExec = jest.fn();
  const accountFind = jest.fn(() => ({
    limit: jest.fn(() => ({
      lean: jest.fn(() => ({ exec: accountFindExec })),
    })),
  }));
  const accountUpdateOne = jest.fn(() => executable());
  const accountModel = {
    find: accountFind,
    updateOne: accountUpdateOne,
  } as unknown as Model<AccountSettingDocument>;

  const userFindByIdAndUpdate = jest.fn(() => executable());
  const userModel = {
    findByIdAndUpdate: userFindByIdAndUpdate,
  } as unknown as Model<UserDocument>;

  const sessionUpdateMany = jest.fn(() => executable());
  const sessionModel = {
    updateMany: sessionUpdateMany,
  } as unknown as Model<UserSessionDocument>;

  const profileUpdateOne = jest.fn(() => executable());
  const profileModel = {
    updateOne: profileUpdateOne,
  } as unknown as Model<ProfileDocument>;

  const mediaFindExec = jest.fn();
  const mediaFind = jest.fn(() => ({
    select: jest.fn(() => ({
      lean: jest.fn(() => ({ exec: mediaFindExec })),
    })),
  }));
  const mediaUpdateMany = jest.fn(() => executable());
  const mediaModel = {
    find: mediaFind,
    updateMany: mediaUpdateMany,
  } as unknown as Model<MediaDocument>;

  const preferenceDeleteMany = jest.fn(() => executable());
  const preferenceModel = {
    deleteMany: preferenceDeleteMany,
  } as unknown as Model<PreferenceDocument>;

  const paymentUpdateMany = jest.fn(() => executable());
  const paymentModel = {
    updateMany: paymentUpdateMany,
  } as unknown as Model<PaymentDocument>;

  const invoiceUpdateMany = jest.fn(() => executable());
  const invoiceModel = {
    updateMany: invoiceUpdateMany,
  } as unknown as Model<PaymentInvoiceDocument>;

  const subscriptionUpdateMany = jest.fn(() => executable());
  const subscriptionModel = {
    updateMany: subscriptionUpdateMany,
  } as unknown as Model<SubscriptionDocument>;

  const verificationUpdateMany = jest.fn(() => executable());
  const verificationModel = {
    updateMany: verificationUpdateMany,
  } as unknown as Model<VerificationDocument>;

  const reportUpdateMany = jest.fn(() => executable());
  const reportModel = {
    updateMany: reportUpdateMany,
  } as unknown as Model<UserReportDocument>;

  const auditLogUpdateMany = jest.fn(() => executable());
  const auditLogModel = {
    updateMany: auditLogUpdateMany,
  } as unknown as Model<AdminAuditLogDocument>;

  const storageService = { deleteFile: jest.fn() };
  const logger = { warn: jest.fn() } as unknown as AppLogger;
  let service: AccountDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();
    accountFindExec.mockResolvedValue([]);
    mediaFindExec.mockResolvedValue([]);
    storageService.deleteFile.mockResolvedValue(undefined);
    service = new AccountDeletionService(
      accountModel,
      userModel,
      sessionModel,
      profileModel,
      mediaModel,
      preferenceModel,
      paymentModel,
      invoiceModel,
      subscriptionModel,
      verificationModel,
      reportModel,
      auditLogModel,
      storageService as unknown as StorageService,
      logger,
    );
  });

  it('purges every account whose scheduled deletion is due', async () => {
    const now = new Date('2026-06-29T00:00:00.000Z');
    const accountIds = [new Types.ObjectId(), new Types.ObjectId()];
    accountFindExec.mockResolvedValue(accountIds.map((userId) => ({ userId })));
    const purgeUser = jest
      .spyOn(service, 'purgeUser')
      .mockResolvedValue({ userId: 'purged', deleted: true });

    await expect(service.purgeDueAccountDeletions(now)).resolves.toEqual({
      purgedCount: 2,
    });
    expect(accountFind).toHaveBeenCalledWith({
      deletionScheduledAt: { $lte: now },
      deletionCompletedAt: { $exists: false },
    });
    expect(purgeUser).toHaveBeenNthCalledWith(
      1,
      accountIds[0].toString(),
      'scheduled_erasure',
    );
    expect(purgeUser).toHaveBeenNthCalledWith(
      2,
      accountIds[1].toString(),
      'scheduled_erasure',
    );
  });

  it('returns zero when no scheduled deletion is due', async () => {
    await expect(service.purgeDueAccountDeletions()).resolves.toEqual({
      purgedCount: 0,
    });
  });

  it('erases storage and anonymizes all account-owned records', async () => {
    const userId = new Types.ObjectId().toString();
    mediaFindExec.mockResolvedValue([
      {
        type: MediaType.IMAGE,
        filename: 'photo.jpg',
      },
      {
        type: MediaType.VIDEO,
        filename: 'intro.mp4',
        thumbnailUrl: 'https://cdn.example/video-thumbnails/thumb.jpg',
      },
      {
        type: MediaType.VIDEO,
        thumbnailUrl: '/',
      },
    ]);
    storageService.deleteFile.mockImplementation(
      (filename: string): Promise<void> => {
        if (filename === 'photo.jpg') return Promise.reject(new Error('S3'));
        if (filename === 'intro.mp4') {
          // Deliberately emulate a provider that rejects with a non-Error value.
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          return Promise.reject('timeout');
        }
        return Promise.resolve();
      },
    );

    await expect(service.purgeUser(userId)).resolves.toEqual({
      userId,
      deleted: true,
    });

    const objectId = new Types.ObjectId(userId);
    expect(storageService.deleteFile).toHaveBeenCalledWith(
      'photo.jpg',
      'profiles/images',
    );
    expect(storageService.deleteFile).toHaveBeenCalledWith(
      'intro.mp4',
      'profiles/videos',
    );
    expect(storageService.deleteFile).toHaveBeenCalledWith(
      'thumb.jpg',
      'profiles/video-thumbnails',
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'Account media erasure file deletion failed',
      { error: 'S3' },
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'Account media erasure file deletion failed',
      { error: 'timeout' },
    );

    expect(userFindByIdAndUpdate).toHaveBeenCalledWith(
      objectId,
      expect.objectContaining({
        $set: expect.objectContaining({
          status: Status.DELETED,
          email: `deleted.${userId}@deleted.matchmate.local`,
          anonymizedAt: expect.any(Date),
          retentionReason: 'user_requested_erasure',
        }),
      }),
    );
    expect(profileUpdateOne).toHaveBeenCalledWith(
      { userId: objectId },
      expect.objectContaining({
        $set: expect.objectContaining({ status: ProfileStatus.DELETED }),
      }),
    );
    expect(mediaUpdateMany).toHaveBeenCalledWith(
      { userId: objectId },
      {
        $set: {
          status: MediaStatus.DELETED,
          isActive: false,
          isPrimary: false,
          deletedAt: expect.any(Date),
          anonymizedAt: expect.any(Date),
          retentionReason: 'user_requested_erasure',
        },
      },
    );
    expect(preferenceDeleteMany).toHaveBeenCalledWith({ userId: objectId });
    expect(sessionUpdateMany).toHaveBeenCalledWith(
      { userId: objectId },
      { $set: { isActive: false, loggedOutAt: expect.any(Date) } },
    );
    expect(accountUpdateOne).toHaveBeenCalledWith(
      { userId: objectId },
      {
        $set: {
          isDeactivated: true,
          deletionCompletedAt: expect.any(Date),
          deletionReason: 'user_requested_erasure',
          anonymizedAt: expect.any(Date),
          retentionReason: 'user_requested_erasure',
        },
      },
    );
    expect(paymentUpdateMany).toHaveBeenCalledWith(
      { userId: objectId },
      expect.objectContaining({
        $set: expect.objectContaining({
          anonymizedAt: expect.any(Date),
          retentionReason: 'finance_tax_compliance',
          source: 'account-erasure-job',
        }),
      }),
    );
    expect(invoiceUpdateMany).toHaveBeenCalledWith(
      { userId: objectId },
      expect.objectContaining({
        $set: expect.objectContaining({
          anonymizedAt: expect.any(Date),
          retentionReason: 'finance_tax_compliance',
        }),
      }),
    );
    expect(subscriptionUpdateMany).toHaveBeenCalledWith(
      { userId: objectId },
      expect.objectContaining({
        $set: expect.objectContaining({
          anonymizedAt: expect.any(Date),
          retentionReason: 'finance_tax_compliance',
        }),
        $unset: { storePurchaseToken: 1 },
      }),
    );
    expect(verificationUpdateMany).toHaveBeenCalledWith(
      { userId: objectId },
      expect.objectContaining({
        $set: expect.objectContaining({
          retentionReason: 'trust_safety_compliance',
        }),
      }),
    );
    expect(reportUpdateMany).toHaveBeenCalledWith(
      { $or: [{ reportedBy: objectId }, { reportedUserId: objectId }] },
      expect.objectContaining({
        $set: expect.objectContaining({
          retentionReason: 'trust_safety_compliance',
        }),
      }),
    );
    expect(auditLogUpdateMany).toHaveBeenCalledWith(
      { $or: [{ actorId: objectId }, { targetId: userId }] },
      expect.objectContaining({
        $set: expect.objectContaining({
          retentionReason: 'security_audit_compliance',
        }),
        $unset: { ipAddress: 1, userAgent: 1 },
      }),
    );
  });

  it('stores an explicit administrative deletion reason', async () => {
    const userId = new Types.ObjectId().toString();

    await service.purgeUser(userId, 'legal_erasure');

    expect(accountUpdateOne).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      expect.objectContaining({
        $set: expect.objectContaining({ deletionReason: 'legal_erasure' }),
      }),
    );
  });
});
