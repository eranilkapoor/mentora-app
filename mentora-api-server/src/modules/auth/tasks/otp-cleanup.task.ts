import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { OtpService } from '../services/otp.service';

@Injectable()
export class OtpCleanupTask {
  constructor(
    private readonly otpService: OtpService,
    private readonly logger: AppLogger,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  cleanupExpiredOtps() {
    const result = this.otpService.cleanupExpiredOtps();

    if (result.removedCount > 0) {
      this.logger.log(
        `OTP cleanup task complete. Removed: ${result.removedCount}, remaining: ${result.remainingCount}`,
      );
    }
  }
}
