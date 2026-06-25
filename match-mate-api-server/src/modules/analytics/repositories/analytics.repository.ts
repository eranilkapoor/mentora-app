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

  getDailySummaryByDay(day: string) {
    return this.dailySummaryModel.findOne({ day }).lean().exec();
  }

  getDailySummaries(options: { from?: Date; to?: Date; limit: number }) {
    const filter: {
      day?: { $gte?: string; $lte?: string };
    } = {};

    if (options.from || options.to) {
      filter.day = {};
      if (options.from) {
        filter.day.$gte = options.from.toISOString().slice(0, 10);
      }
      if (options.to) {
        filter.day.$lte = options.to.toISOString().slice(0, 10);
      }
    }

    return this.dailySummaryModel
      .find(filter)
      .sort({ day: -1 })
      .limit(options.limit)
      .lean()
      .exec();
  }
}
