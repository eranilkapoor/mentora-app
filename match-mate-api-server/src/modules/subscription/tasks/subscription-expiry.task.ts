import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '../services/subscription.service';

@Injectable()
export class SubscriptionExpiryTask {
  private readonly logger = new Logger(SubscriptionExpiryTask.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

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
      this.logger.error('Subscription expiry task failed', err);
    }
  }
}
