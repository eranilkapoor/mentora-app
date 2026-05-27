import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { SubscriptionService } from '../services/subscription.service';

@Injectable()
export class SubscriptionExpiryTask {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly logger: AppLogger,
  ) {}

  // Runs at midnight every day
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOverdueSubscriptions() {
    try {
      const result =
        await this.subscriptionService.expireOverdueSubscriptions();
      this.logger.log(
        `Subscription expiry task complete. Expired: ${result.expiredCount}`,
      );
    } catch (err) {
      this.logger.error(
        'Subscription expiry task failed',
        err instanceof Error ? err.stack : undefined,
        { error: err instanceof Error ? err.message : String(err) },
      );
    }
  }
}
