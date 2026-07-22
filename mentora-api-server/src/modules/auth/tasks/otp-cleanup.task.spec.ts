import { OtpCleanupTask } from './otp-cleanup.task';

describe('OtpCleanupTask', () => {
  const otpService = {
    cleanupExpiredOtps: jest.fn(),
  };

  const logger = {
    log: jest.fn(),
  };

  let task: OtpCleanupTask;

  beforeEach(() => {
    jest.clearAllMocks();
    task = new OtpCleanupTask(otpService as never, logger as never);
  });

  it('logs cleanup details when expired OTPs are removed', () => {
    otpService.cleanupExpiredOtps.mockReturnValue({
      removedCount: 3,
      remainingCount: 5,
    });

    task.cleanupExpiredOtps();

    expect(logger.log).toHaveBeenCalledWith(
      'OTP cleanup task complete. Removed: 3, remaining: 5',
    );
  });

  it('does not log when no OTPs are removed', () => {
    otpService.cleanupExpiredOtps.mockReturnValue({
      removedCount: 0,
      remainingCount: 10,
    });

    task.cleanupExpiredOtps();

    expect(logger.log).not.toHaveBeenCalled();
  });
});
