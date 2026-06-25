import { FraudDetectionTask } from './fraud-detection.task';

describe('FraudDetectionTask', () => {
  const fraudDetectionService = {
    runBatchScan: jest.fn(),
  };

  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  let task: FraudDetectionTask;

  beforeEach(() => {
    jest.clearAllMocks();
    task = new FraudDetectionTask(
      fraudDetectionService as never,
      logger as never,
    );
  });

  it('logs summary when scan flags users', async () => {
    fraudDetectionService.runBatchScan.mockResolvedValue({
      flaggedUsers: 3,
      highRiskUsers: 1,
      scannedUsers: 20,
    });

    await task.runDailyFraudScan();

    expect(logger.log).toHaveBeenCalledWith('Daily fraud scan flagged users', {
      flaggedUsers: 3,
      highRiskUsers: 1,
      scannedUsers: 20,
    });
  });

  it('does not emit summary log when no users are flagged', async () => {
    fraudDetectionService.runBatchScan.mockResolvedValue({
      flaggedUsers: 0,
      highRiskUsers: 0,
      scannedUsers: 20,
    });

    await task.runDailyFraudScan();

    expect(logger.log).not.toHaveBeenCalled();
  });

  it('logs errors when scan fails', async () => {
    fraudDetectionService.runBatchScan.mockRejectedValue(
      new Error('scan failed'),
    );

    await task.runDailyFraudScan();

    expect(logger.error).toHaveBeenCalledWith(
      'Daily fraud scan failed',
      expect.any(String),
      expect.objectContaining({ error: 'scan failed' }),
    );
  });
});
