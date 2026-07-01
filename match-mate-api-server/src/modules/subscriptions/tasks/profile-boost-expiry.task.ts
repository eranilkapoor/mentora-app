import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'mongoose';
import { AppLogger } from '@/common/logger/logger.service';
import { ProfileBoostService } from '../services/profile-boost.service';

@Injectable()
export class ProfileBoostExpiryTask {
  constructor(
    private readonly profileBoostService: ProfileBoostService,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly logger: AppLogger,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireOverdueBoosts() {
    if (this.shouldSkipForMongoUnavailable()) {
      return;
    }

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

  private shouldSkipForMongoUnavailable(): boolean {
    const driver = this.configService.get<string>('mongo.driver', 'mongo');

    if (driver === 'local') {
      this.logger.warn(
        'Profile boost expiry skipped: MongoDB disabled in local driver mode',
      );
      return true;
    }

    if (Number(this.mongoConnection.readyState) !== 1) {
      this.logger.warn(
        `Profile boost expiry skipped: MongoDB not connected (readyState=${Number(
          this.mongoConnection.readyState,
        )})`,
      );
      return true;
    }

    return false;
  }
}
