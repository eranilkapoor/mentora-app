import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Connection } from 'mongoose';
import { AppLogger } from '@/common/logger/logger.service';
import { PaymentsService } from '../services/payments.service';

@Injectable()
export class PaymentMaintenanceTask {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly logger: AppLogger,
  ) {}

  @Cron('*/30 * * * *')
  async expireStalePendingPayments() {
    if (this.shouldSkipForMongoUnavailable()) {
      return;
    }

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

  private shouldSkipForMongoUnavailable(): boolean {
    const driver = this.configService.get<string>('mongo.driver', 'mongo');

    if (driver === 'local') {
      this.logger.warn(
        'Payment maintenance skipped: MongoDB disabled in local driver mode',
      );
      return true;
    }

    if (Number(this.mongoConnection.readyState) !== 1) {
      this.logger.warn(
        `Payment maintenance skipped: MongoDB not connected (readyState=${Number(
          this.mongoConnection.readyState,
        )})`,
      );
      return true;
    }

    return false;
  }
}
