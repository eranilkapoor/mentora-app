import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnalyticsEvent } from './schemas/analytics-event.schema';
import { Model } from 'mongoose';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectModel(AnalyticsEvent.name)
    private readonly model: Model<AnalyticsEvent>,
  ) {}

  create(data: Partial<AnalyticsEvent>) {
    return this.model.create(data);
  }

  aggregateStats(match: Record<string, unknown>) {
    return this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
