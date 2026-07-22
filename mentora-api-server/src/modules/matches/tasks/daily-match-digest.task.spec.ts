import { Types } from 'mongoose';
import { DailyMatchDigestTask } from './daily-match-digest.task';

describe('DailyMatchDigestTask', () => {
  const discoveryRepo = {
    getActiveDiscoveryUserIds: jest.fn(),
    markDailyMatchDigestSent: jest.fn(),
  };
  const discoveryService = {
    getRecommendedMatches: jest.fn(),
  };
  const notificationService = {
    notifyDailyMatches: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
  };
  const metrics = {
    recordMatchDigest: jest.fn(),
  };

  let task: DailyMatchDigestTask;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string, fallback: unknown) => {
      const values: Record<string, unknown> = {
        'matches.dailyDigestEnabled': true,
        'matches.dailyDigestDryRun': false,
        'matches.dailyDigestLimit': 25,
      };
      return values[key] ?? fallback;
    });
    discoveryRepo.getActiveDiscoveryUserIds.mockResolvedValue(['user-1']);
    discoveryRepo.markDailyMatchDigestSent.mockResolvedValue(undefined);
    discoveryService.getRecommendedMatches.mockResolvedValue({
      data: [{ userId: 'target-1' }, { userId: new Types.ObjectId() }],
    });
    notificationService.notifyDailyMatches.mockResolvedValue(undefined);
    task = new DailyMatchDigestTask(
      discoveryRepo as never,
      discoveryService as never,
      notificationService as never,
      configService as never,
      logger as never,
      metrics as never,
    );
  });

  it('skips when disabled', async () => {
    configService.get.mockImplementation((key: string, fallback: unknown) =>
      key === 'matches.dailyDigestEnabled' ? false : fallback,
    );

    await expect(task.sendDailyMatches()).resolves.toMatchObject({
      scanned: 0,
      eligible: 0,
      sent: 0,
      errors: 0,
      dryRun: false,
    });
    expect(discoveryRepo.getActiveDiscoveryUserIds).not.toHaveBeenCalled();
  });

  it('loads only users not processed for the current day', async () => {
    await task.sendDailyMatches();

    expect(discoveryRepo.getActiveDiscoveryUserIds).toHaveBeenCalledWith(
      25,
      expect.any(Date),
    );
    const [, cutoff] = discoveryRepo.getActiveDiscoveryUserIds.mock
      .calls[0] as [number, Date];
    expect(cutoff.getHours()).toBe(0);
    expect(cutoff.getMinutes()).toBe(0);
    expect(cutoff.getSeconds()).toBe(0);
  });

  it('sends and marks successful digest deliveries', async () => {
    const result = await task.sendDailyMatches();

    expect(notificationService.notifyDailyMatches).toHaveBeenCalledWith(
      'user-1',
      2,
      'target-1',
    );
    expect(discoveryRepo.markDailyMatchDigestSent).toHaveBeenCalledWith(
      'user-1',
      2,
      'target-1',
      expect.any(Date),
    );
    expect(result).toMatchObject({
      scanned: 1,
      eligible: 1,
      sent: 1,
      errors: 0,
      dryRun: false,
    });
  });

  it('keeps dry-run non-mutating', async () => {
    configService.get.mockImplementation((key: string, fallback: unknown) => {
      if (key === 'matches.dailyDigestDryRun') return true;
      if (key === 'matches.dailyDigestLimit') return 10;
      return fallback;
    });

    const result = await task.sendDailyMatches();

    expect(notificationService.notifyDailyMatches).not.toHaveBeenCalled();
    expect(discoveryRepo.markDailyMatchDigestSent).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      scanned: 1,
      eligible: 1,
      sent: 0,
      errors: 0,
      dryRun: true,
    });
  });

  it('continues processing after a user-level failure', async () => {
    discoveryRepo.getActiveDiscoveryUserIds.mockResolvedValue(['u1', 'u2']);
    discoveryService.getRecommendedMatches
      .mockRejectedValueOnce(new Error('profile unavailable'))
      .mockResolvedValueOnce({ data: [{ userId: 'target-2' }] });

    const result = await task.sendDailyMatches();

    expect(logger.warn).toHaveBeenCalledWith(
      'Daily match digest skipped for user u1: profile unavailable',
    );
    expect(notificationService.notifyDailyMatches).toHaveBeenCalledWith(
      'u2',
      1,
      'target-2',
    );
    expect(result).toMatchObject({
      scanned: 2,
      eligible: 1,
      sent: 1,
      errors: 1,
    });
  });
});
