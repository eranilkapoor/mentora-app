import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { FraudDetectionService } from '../services/fraud-detection.service';

@Injectable()
export class FraudDetectionTask {
  constructor(
    private readonly fraudDetectionService: FraudDetectionService,
    private readonly logger: AppLogger,
  ) {}

  @Cron('30 2 * * *')
  async runDailyFraudScan() {
    try {
      const result = await this.fraudDetectionService.runBatchScan();

      if (result.flaggedUsers > 0) {
        this.logger.log('Daily fraud scan flagged users', {
          flaggedUsers: result.flaggedUsers,
          highRiskUsers: result.highRiskUsers,
          scannedUsers: result.scannedUsers,
        });
      }
    } catch (error) {
      this.logger.error(
        'Daily fraud scan failed',
        error instanceof Error ? error.stack : undefined,
        { error: error instanceof Error ? error.message : String(error) },
      );
    }
  }
}
