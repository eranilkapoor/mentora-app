import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { AnalyticsService } from '../services/analytics.service';

@Injectable()
export class AnalyticsAggregationTask {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly logger: AppLogger,
  ) {}

  @Cron('15 1 * * *')
  async aggregateDailySummary() {
    try {
      const summary = await this.analyticsService.aggregateDailySummary();
      this.logger.log('Analytics daily aggregation complete', {
        day: summary?.day,
        generatedAt: summary?.generatedAt,
      });
    } catch (err) {
      this.logger.error(
        'Analytics daily aggregation failed',
        err instanceof Error ? err.stack : undefined,
        { error: err instanceof Error ? err.message : String(err) },
      );
    }
  }
}
