import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { SubscriptionsService } from '../services/subscriptions.service';

@Injectable()
export class SubscriptionExpiryTask {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly logger: AppLogger,
  ) {}

  // Runs at midnight every day
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOverdueSubscriptions() {
    try {
      const result =
        await this.subscriptionsService.expireOverdueSubscriptions();
      this.logger.log(
        `Subscription expiry task complete. Expired: ${result.expiredCount}`,
      );
      const reminders = await this.subscriptionsService.markExpiryRemindersDue([
        7, 3, 1,
      ]);
      this.logger.log(
        `Subscription reminder task complete. Marked: ${JSON.stringify(reminders.reminders)}`,
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
