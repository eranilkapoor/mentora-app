import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsRepository } from './repositories/analytics.repository';
import {
  AnalyticsEvent,
  AnalyticsEventSchema,
} from './schemas/analytics-event.schema';
import {
  AnalyticsDailySummary,
  AnalyticsDailySummarySchema,
} from './schemas/analytics-daily-summary.schema';
import { AnalyticsAggregationTask } from './tasks/analytics-aggregation.task';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      {
        name: AnalyticsDailySummary.name,
        schema: AnalyticsDailySummarySchema,
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository, AnalyticsAggregationTask],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
