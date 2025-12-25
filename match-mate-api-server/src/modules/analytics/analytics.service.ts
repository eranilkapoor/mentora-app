import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  async trackEvent(dto: TrackEventDto) {
    return this.repo.create({
      userId: dto.userId,
      eventType: dto.eventType,
      metadata: dto.metadata,
      platform: dto.platform || 'web',
    });
  }

  async getStats(query: any) {
    const match: any = {};

    if (query.eventType) {
      match.eventType = query.eventType;
    }

    if (query.from || query.to) {
      match.createdAt = {};
      if (query.from) match.createdAt.$gte = new Date(query.from);
      if (query.to) match.createdAt.$lte = new Date(query.to);
    }

    return this.repo.aggregateStats(match);
  }
}
