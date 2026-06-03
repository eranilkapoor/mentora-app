import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { PaymentsService } from '../services/payments.service';

@Injectable()
export class PaymentMaintenanceTask {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly logger: AppLogger,
  ) {}

  @Cron('*/30 * * * *')
  async expireStalePendingPayments() {
    try {
      const result = await this.paymentsService.expireStalePendingPayments();
      if (result.expiredCount > 0) {
        this.logger.log(
          `Payment maintenance expired stale orders: ${result.expiredCount}`,
        );
      }
    } catch (err) {
      this.logger.error(
        'Payment maintenance task failed',
        err instanceof Error ? err.stack : undefined,
        { error: err instanceof Error ? err.message : String(err) },
      );
    }
  }
}
