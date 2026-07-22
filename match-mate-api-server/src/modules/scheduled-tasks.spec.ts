import { DailyMatchDigestTask } from './matches/tasks/daily-match-digest.task';
import { MatchExpiryTask } from './matches/tasks/match-expiry.task';
import { PaymentMaintenanceTask } from './payments/tasks/payment-maintenance.task';
import { MediaCleanupTask } from './profiles/tasks/media-cleanup.task';
import { ProfileArchiveTask } from './profiles/tasks/profile-archive.task';
import { AccountDeletionTask } from './settings/tasks/account-deletion.task';
import { ProfileBoostExpiryTask } from './subscriptions/tasks/profile-boost-expiry.task';
import { SubscriptionExpiryTask } from './subscriptions/tasks/subscription-expiry.task';

describe('scheduled maintenance tasks', () => {
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const config = { get: jest.fn() };
  const mongoConnection = { readyState: 1 };
  const metrics = { recordMatchDigest: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    config.get.mockImplementation(
      (_key: string, fallback?: unknown) => fallback,
    );
  });

  describe('DailyMatchDigestTask', () => {
    const repo = { getActiveDiscoveryUserIds: jest.fn() };
    const discovery = { getRecommendedMatches: jest.fn() };
    const notifications = { notifyDailyMatches: jest.fn() };

    const build = () =>
      new DailyMatchDigestTask(
        repo as never,
        discovery as never,
        notifications as never,
        config as never,
        logger as never,
        metrics as never,
      );

    it('skips disabled delivery and reports configured dry-run state', async () => {
      config.get.mockImplementation((key: string, fallback: unknown) =>
        key.endsWith('Enabled')
          ? false
          : key.endsWith('DryRun')
            ? true
            : fallback,
      );

      await expect(build().sendDailyMatches()).resolves.toEqual({
        scanned: 0,
        eligible: 0,
        sent: 0,
        errors: 0,
        dryRun: true,
      });
      expect(repo.getActiveDiscoveryUserIds).not.toHaveBeenCalled();
    });

    it('sends eligible matches, skips empty results, and isolates user failures', async () => {
      repo.getActiveDiscoveryUserIds.mockResolvedValue([
        'u1',
        'u2',
        'u3',
        'u4',
      ]);
      discovery.getRecommendedMatches
        .mockResolvedValueOnce({ data: [{ userId: 'match-1' }] })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: 'invalid' })
        .mockRejectedValueOnce(new Error('profile unavailable'));
      notifications.notifyDailyMatches.mockResolvedValue(undefined);

      await expect(build().sendDailyMatches()).resolves.toEqual({
        scanned: 4,
        eligible: 1,
        sent: 1,
        errors: 1,
        dryRun: false,
      });
      expect(notifications.notifyDailyMatches).toHaveBeenCalledWith(
        'u1',
        1,
        'match-1',
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('profile unavailable'),
      );
    });

    it('counts dry-run users without notifying and handles non-Error failures', async () => {
      config.get.mockImplementation((key: string, fallback: unknown) =>
        key.endsWith('DryRun') ? true : fallback,
      );
      repo.getActiveDiscoveryUserIds.mockResolvedValue(['u1', 'u2']);
      const sparseMatch = new Array(1);
      discovery.getRecommendedMatches
        .mockResolvedValueOnce({ data: sparseMatch })
        .mockRejectedValueOnce('failed');

      const result = await build().sendDailyMatches();

      expect(result.eligible).toBe(1);
      expect(result.sent).toBe(0);
      expect(notifications.notifyDailyMatches).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('failed'),
      );
    });

    it('safely emits a digest when the first match has no user identifier', async () => {
      repo.getActiveDiscoveryUserIds.mockResolvedValue(['u1']);
      discovery.getRecommendedMatches.mockResolvedValue({ data: new Array(1) });

      await build().sendDailyMatches();

      expect(notifications.notifyDailyMatches).toHaveBeenCalledWith(
        'u1',
        1,
        '',
      );
    });
  });

  describe('MatchExpiryTask', () => {
    const service = { expireOverdueMatches: jest.fn() };
    const build = () =>
      new MatchExpiryTask(service as never, config as never, logger as never);

    it('skips when disabled', async () => {
      config.get.mockReturnValue(false);
      await expect(build().expireOverdueMatches()).resolves.toBeUndefined();
      expect(service.expireOverdueMatches).not.toHaveBeenCalled();
    });

    it.each([1, 0])(
      'processes expiry results with modifiedCount %s',
      async (count) => {
        config.get.mockImplementation((key: string, fallback: unknown) =>
          key.endsWith('Enabled') ? true : fallback,
        );
        service.expireOverdueMatches.mockResolvedValue({
          modifiedCount: count,
        });
        await build().expireOverdueMatches();
        expect(service.expireOverdueMatches).toHaveBeenCalledWith(500);
        expect(logger.log).toHaveBeenCalledTimes(count > 0 ? 1 : 0);
      },
    );

    it.each([new Error('expiry failed'), 'expiry failed'])(
      'logs expiry failures',
      async (error) => {
        config.get.mockReturnValue(true);
        service.expireOverdueMatches.mockRejectedValue(error);
        await build().expireOverdueMatches();
        expect(logger.error).toHaveBeenCalledWith(
          'Match expiry task failed',
          error instanceof Error ? error.stack : undefined,
          { error: 'expiry failed' },
        );
      },
    );
  });

  describe('MediaCleanupTask', () => {
    const service = { cleanupDeletedMedia: jest.fn() };
    const build = () =>
      new MediaCleanupTask(service as never, config as never, logger as never);

    it.each([
      [{ scannedCount: 1, failedMediaIds: [] }, 1],
      [{ scannedCount: 0, failedMediaIds: ['m1'] }, 1],
      [{ scannedCount: 0, failedMediaIds: [] }, 0],
    ])('logs only meaningful cleanup results', async (result, logCount) => {
      service.cleanupDeletedMedia.mockResolvedValue(result);
      await build().cleanupDeletedMedia();
      expect(service.cleanupDeletedMedia).toHaveBeenCalledWith(7, 100);
      expect(logger.log).toHaveBeenCalledTimes(logCount);
    });

    it.each([new Error('cleanup failed'), 'cleanup failed'])(
      'logs cleanup failures',
      async (error) => {
        service.cleanupDeletedMedia.mockRejectedValue(error);
        await build().cleanupDeletedMedia();
        expect(logger.error).toHaveBeenCalledWith(
          'Media cleanup task failed',
          error instanceof Error ? error.stack : undefined,
          { error: 'cleanup failed' },
        );
      },
    );
  });

  describe('ProfileArchiveTask', () => {
    const service = { archiveInactiveProfiles: jest.fn() };
    const build = () =>
      new ProfileArchiveTask(
        service as never,
        config as never,
        logger as never,
      );

    it.each([
      [{ skipped: false, modifiedCount: 2 }, 1],
      [{ skipped: true, modifiedCount: 2 }, 0],
      [{ skipped: false, modifiedCount: 0 }, 0],
    ])('logs only completed archive mutations', async (result, logCount) => {
      service.archiveInactiveProfiles.mockResolvedValue(result);
      await build().archiveInactiveProfiles();
      expect(service.archiveInactiveProfiles).toHaveBeenCalledWith(180, 500);
      expect(logger.log).toHaveBeenCalledTimes(logCount);
    });

    it.each([new Error('archive failed'), 'archive failed'])(
      'logs archive failures',
      async (error) => {
        service.archiveInactiveProfiles.mockRejectedValue(error);
        await build().archiveInactiveProfiles();
        expect(logger.error).toHaveBeenCalledWith(
          'Profile archive task failed',
          error instanceof Error ? error.stack : undefined,
          { error: 'archive failed' },
        );
      },
    );
  });

  describe('SubscriptionExpiryTask', () => {
    const service = {
      expireOverdueSubscriptions: jest.fn(),
      markExpiryRemindersDue: jest.fn(),
    };
    const build = () =>
      new SubscriptionExpiryTask(service as never, logger as never);

    it('expires subscriptions and marks reminder windows', async () => {
      service.expireOverdueSubscriptions.mockResolvedValue({ expiredCount: 2 });
      service.markExpiryRemindersDue.mockResolvedValue({ reminders: [7, 3] });
      await build().expireOverdueSubscriptions();
      expect(service.markExpiryRemindersDue).toHaveBeenCalledWith([7, 3, 1]);
      expect(logger.log).toHaveBeenCalledTimes(2);
    });

    it.each([new Error('subscription failed'), 'subscription failed'])(
      'logs subscription failures',
      async (error) => {
        service.expireOverdueSubscriptions.mockRejectedValue(error);
        await build().expireOverdueSubscriptions();
        expect(logger.error).toHaveBeenCalledWith(
          'Subscription expiry task failed',
          error instanceof Error ? error.stack : undefined,
          { error: 'subscription failed' },
        );
      },
    );
  });

  describe('PaymentMaintenanceTask', () => {
    const service = { expireStalePendingPayments: jest.fn() };
    const build = () =>
      new PaymentMaintenanceTask(
        service as never,
        config as never,
        mongoConnection as never,
        logger as never,
      );

    it.each([
      [
        'local',
        1,
        'Payment maintenance skipped: MongoDB disabled in local driver mode',
      ],
      [
        'mongo',
        0,
        'Payment maintenance skipped: MongoDB not connected (readyState=0)',
      ],
    ])(
      'skips when mongo is unavailable',
      async (driver, readyState, message) => {
        config.get.mockImplementation((key: string, fallback?: unknown) =>
          key === 'mongo.driver' ? driver : fallback,
        );
        mongoConnection.readyState = readyState;

        await build().expireStalePendingPayments();

        expect(service.expireStalePendingPayments).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(message);
        mongoConnection.readyState = 1;
      },
    );

    it.each([2, 0])(
      'processes stale payment count %s',
      async (expiredCount) => {
        mongoConnection.readyState = 1;
        service.expireStalePendingPayments.mockResolvedValue({ expiredCount });
        await build().expireStalePendingPayments();
        expect(logger.log).toHaveBeenCalledTimes(expiredCount > 0 ? 1 : 0);
      },
    );

    it.each([new Error('payment failed'), 'payment failed'])(
      'logs payment failures',
      async (error) => {
        service.expireStalePendingPayments.mockRejectedValue(error);
        await build().expireStalePendingPayments();
        expect(logger.error).toHaveBeenCalledWith(
          'Payment maintenance task failed',
          error instanceof Error ? error.stack : undefined,
          { error: 'payment failed' },
        );
      },
    );
  });

  describe('AccountDeletionTask', () => {
    const service = { purgeDueAccountDeletions: jest.fn() };
    const build = () =>
      new AccountDeletionTask(service as never, logger as never);

    it('purges due account deletions', async () => {
      service.purgeDueAccountDeletions.mockResolvedValue({ purgedCount: 3 });
      await build().purgeDueAccountDeletions();
      expect(logger.log).toHaveBeenCalledWith(
        'Account deletion purge complete. Purged: 3',
      );
    });

    it.each([new Error('purge failed'), 'purge failed'])(
      'logs purge failures',
      async (error) => {
        service.purgeDueAccountDeletions.mockRejectedValue(error);
        await build().purgeDueAccountDeletions();
        expect(logger.error).toHaveBeenCalledWith(
          'Account deletion purge failed',
          error instanceof Error ? error.stack : undefined,
        );
      },
    );
  });

  describe('ProfileBoostExpiryTask', () => {
    const service = { expireOverdueBoosts: jest.fn() };
    const build = () =>
      new ProfileBoostExpiryTask(
        service as never,
        config as never,
        mongoConnection as never,
        logger as never,
      );

    it.each([
      [
        'local',
        1,
        'Profile boost expiry skipped: MongoDB disabled in local driver mode',
      ],
      [
        'mongo',
        0,
        'Profile boost expiry skipped: MongoDB not connected (readyState=0)',
      ],
    ])(
      'skips when mongo is unavailable',
      async (driver, readyState, message) => {
        config.get.mockImplementation((key: string, fallback?: unknown) =>
          key === 'mongo.driver' ? driver : fallback,
        );
        mongoConnection.readyState = readyState;

        await build().expireOverdueBoosts();

        expect(service.expireOverdueBoosts).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(message);
        mongoConnection.readyState = 1;
      },
    );

    it('expires overdue boosts', async () => {
      mongoConnection.readyState = 1;
      service.expireOverdueBoosts.mockResolvedValue({ expiredCount: 4 });
      await build().expireOverdueBoosts();
      expect(logger.log).toHaveBeenCalledWith(
        'Profile boost expiry complete. Expired: 4',
      );
    });

    it.each([new Error('boost failed'), 'boost failed'])(
      'logs boost failures',
      async (error) => {
        service.expireOverdueBoosts.mockRejectedValue(error);
        await build().expireOverdueBoosts();
        expect(logger.error).toHaveBeenCalledWith(
          'Profile boost expiry failed',
          error instanceof Error ? error.stack : undefined,
        );
      },
    );
  });
});
