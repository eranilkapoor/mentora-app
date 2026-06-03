import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { ProfileBoostService } from '../services/profile-boost.service';

@Injectable()
export class ProfileBoostExpiryTask {
  constructor(
    private readonly profileBoostService: ProfileBoostService,
    private readonly logger: AppLogger,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireOverdueBoosts() {
    try {
      const result = await this.profileBoostService.expireOverdueBoosts();
      this.logger.log(
        `Profile boost expiry complete. Expired: ${result.expiredCount}`,
      );
    } catch (error) {
      this.logger.error(
        'Profile boost expiry failed',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
