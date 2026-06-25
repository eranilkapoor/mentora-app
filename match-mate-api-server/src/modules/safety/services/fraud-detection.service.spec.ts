import { Types } from 'mongoose';
import { FraudDetectionService } from './fraud-detection.service';

describe('FraudDetectionService', () => {
  const userHigh = new Types.ObjectId();
  const userMedium = new Types.ObjectId();

  const userReportModel = {
    aggregate: jest.fn(),
  };
  const paymentModel = {
    aggregate: jest.fn(),
  };
  const activityLogModel = {
    aggregate: jest.fn(),
  };
  const userSessionModel = {
    aggregate: jest.fn(),
  };
  const logger = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    userReportModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: userHigh, count: 4 },
        { _id: userMedium, count: 3 },
      ]),
    });

    paymentModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: userHigh, count: 3 }]),
    });

    activityLogModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: userHigh, count: 2 }]),
    });

    userSessionModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: userHigh, ipCount: 6 },
        { _id: userMedium, ipCount: 1 },
      ]),
    });
  });

  it('computes risk signals and sorts candidates by descending score', async () => {
    const service = new FraudDetectionService(
      userReportModel as never,
      paymentModel as never,
      activityLogModel as never,
      userSessionModel as never,
      logger as never,
    );

    const result = await service.runBatchScan({
      windowDays: 14,
      highRiskThreshold: 70,
    });

    expect(result.scannedUsers).toBe(2);
    expect(result.flaggedUsers).toBe(2);
    expect(result.highRiskUsers).toBe(1);
    expect(result.candidates[0]?.userId).toBe(userHigh.toString());
    expect(result.candidates[0]?.riskScore).toBeGreaterThanOrEqual(70);
    expect(result.candidates[1]?.userId).toBe(userMedium.toString());
    expect(result.candidates[1]?.signals).toHaveLength(1);
    expect(result.candidates[1]?.signals[0]?.key).toBe('high_report_volume');
  });

  it('respects result limit and excludes users without triggered rules', async () => {
    userReportModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: userHigh, count: 4 }]),
    });
    paymentModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    activityLogModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    userSessionModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: userHigh, ipCount: 4 },
        { _id: userMedium, ipCount: 2 },
      ]),
    });

    const service = new FraudDetectionService(
      userReportModel as never,
      paymentModel as never,
      activityLogModel as never,
      userSessionModel as never,
      logger as never,
    );

    const result = await service.runBatchScan({ limit: 1 });

    expect(result.scannedUsers).toBe(2);
    expect(result.flaggedUsers).toBe(1);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.userId).toBe(userHigh.toString());
  });
});
