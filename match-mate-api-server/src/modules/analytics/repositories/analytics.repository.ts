import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnalyticsEvent } from '../schemas/analytics-event.schema';
import { Model, PipelineStage } from 'mongoose';
import { AnalyticsDailySummary } from '../schemas/analytics-daily-summary.schema';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectModel(AnalyticsEvent.name)
    private readonly model: Model<AnalyticsEvent>,
    @InjectModel(AnalyticsDailySummary.name)
    private readonly dailySummaryModel: Model<AnalyticsDailySummary>,
  ) {}

  create(data: Partial<AnalyticsEvent>) {
    return this.model.create(data);
  }

  aggregate<T>(pipeline: PipelineStage[]) {
    return this.model.aggregate<T>(pipeline);
  }

  count(match: Record<string, unknown>) {
    return this.model.countDocuments(match);
  }

  distinctUsers(match: Record<string, unknown>) {
    return this.model.distinct('userId', match);
  }

  upsertDailySummary(data: Partial<AnalyticsDailySummary> & { day: string }) {
    return this.dailySummaryModel
      .findOneAndUpdate(
        { day: data.day },
        { $set: data },
        { new: true, upsert: true, runValidators: true },
      )
      .lean()
      .exec();
  }
}
