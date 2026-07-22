import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { AccountDeletionService } from '../services/account-deletion.service';

@Injectable()
export class AccountDeletionTask {
  constructor(
    private readonly accountDeletionService: AccountDeletionService,
    private readonly logger: AppLogger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async purgeDueAccountDeletions() {
    try {
      const result =
        await this.accountDeletionService.purgeDueAccountDeletions();
      this.logger.log(
        `Account deletion purge complete. Purged: ${result.purgedCount}`,
      );
    } catch (error) {
      this.logger.error(
        'Account deletion purge failed',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
