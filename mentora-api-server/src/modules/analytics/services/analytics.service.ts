import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { AnalyticsSummaryQueryDto } from '../dto/analytics-summary-query.dto';
import { TrackEventDto } from '../dto/track-event.dto';
import {
  AnalyticsEventType,
  AnalyticsFunnelStage,
  AnalyticsGroupBy,
  AnalyticsPlatform,
} from '../enums/analytics-event.enum';

interface AnalyticsDateRange {
  $gte?: Date;
  $lte?: Date;
}

interface AnalyticsMatch extends Record<string, unknown> {
  eventType?: AnalyticsEventType | { $in: AnalyticsEventType[] };
  occurredAt?: AnalyticsDateRange;
}

export interface AnalyticsStatRow {
  key: string;
  count: number;
  uniqueUsers: number;
}

interface FunnelStep {
  eventType: AnalyticsEventType;
  label: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  getEventTaxonomy() {
    return {
      eventTypes: Object.values(AnalyticsEventType),
      platforms: Object.values(AnalyticsPlatform),
      funnelStages: Object.values(AnalyticsFunnelStage),
      groupByDimensions: Object.values(AnalyticsGroupBy),
    };
  }

  async trackEvent(dto: TrackEventDto) {
    return this.repo.create({
      userId: dto.userId,
      eventType: dto.eventType,
      sessionId: dto.sessionId,
      deviceId: dto.deviceId,
      profileId: dto.profileId,
      targetUserId: dto.targetUserId,
      matchId: dto.matchId,
      chatId: dto.chatId,
      funnelStage: dto.funnelStage,
      source: dto.source,
      medium: dto.medium,
      campaign: dto.campaign,
      screen: dto.screen,
      country: dto.country,
      state: dto.state,
      city: dto.city,
      isPremium: dto.isPremium ?? false,
      success: dto.success,
      durationMs: dto.durationMs,
      value: dto.value,
      appVersion: dto.appVersion,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      metadata: dto.metadata,
      platform: dto.platform,
    });
  }

  async getStats(query: AnalyticsQueryDto) {
    const match = this.buildMatch(query);
    const groupBy = query.groupBy ?? AnalyticsGroupBy.EVENT_TYPE;
    const topN = query.topN ?? 10;
    const groupField = this.getGroupField(groupBy);

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: groupField,
          count: { $sum: 1 },
          uniqueUsersSet: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 0,
          key: { $ifNull: ['$_id', 'UNKNOWN'] },
          count: 1,
          uniqueUsers: {
            $size: {
              $filter: {
                input: '$uniqueUsersSet',
                as: 'uid',
                cond: { $ne: ['$$uid', null] },
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: topN },
    ];

    const rows = await this.repo.aggregate<AnalyticsStatRow>(pipeline);

    return {
      groupBy,
      topN,
      totalGroups: rows.length,
      rows,
    };
  }

  async getOverview(query: AnalyticsQueryDto) {
    const match = this.buildMatch(query);
    const [
      totalEvents,
      uniqueUsers,
      platforms,
      topEvents,
      impressions,
      profileViews,
      interests,
      matches,
      chats,
      recentTrend,
    ] = await Promise.all([
      this.repo.count(match),
      this.repo.distinctUsers(match),
      this.repo.aggregate<AnalyticsStatRow>([
        { $match: match },
        {
          $group: {
            _id: '$platform',
            count: { $sum: 1 },
            uniqueUsersSet: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            _id: 0,
            key: { $ifNull: ['$_id', 'UNKNOWN'] },
            count: 1,
            uniqueUsers: {
              $size: {
                $filter: {
                  input: '$uniqueUsersSet',
                  as: 'uid',
                  cond: { $ne: ['$$uid', null] },
                },
              },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),
      this.repo.aggregate<AnalyticsStatRow>([
        { $match: match },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            uniqueUsersSet: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            _id: 0,
            key: '$_id',
            count: 1,
            uniqueUsers: {
              $size: {
                $filter: {
                  input: '$uniqueUsersSet',
                  as: 'uid',
                  cond: { $ne: ['$$uid', null] },
                },
              },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      this.repo.count({
        ...match,
        eventType: AnalyticsEventType.PROFILE_IMPRESSION,
      }),
      this.repo.count({
        ...match,
        eventType: AnalyticsEventType.PROFILE_VIEWED,
      }),
      this.repo.count({
        ...match,
        eventType: AnalyticsEventType.MATCH_REQUEST_SENT,
      }),
      this.repo.count({
        ...match,
        eventType: AnalyticsEventType.MATCH_ACCEPTED,
      }),
      this.repo.count({ ...match, eventType: AnalyticsEventType.CHAT_STARTED }),
      this.repo.aggregate<{ date: string; count: number }>([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$occurredAt',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } },
        { $limit: 31 },
      ]),
    ]);

    const safeRate = (num: number, den: number) =>
      den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0;

    return {
      totals: {
        totalEvents,
        uniqueUsers: uniqueUsers.filter(Boolean).length,
      },
      conversion: {
        impressionToViewRate: safeRate(profileViews, impressions),
        viewToInterestRate: safeRate(interests, profileViews),
        interestToMatchRate: safeRate(matches, interests),
        matchToChatRate: safeRate(chats, matches),
      },
      dimensions: {
        byPlatform: platforms,
        topEvents,
      },
      trend: recentTrend,
    };
  }

  async getFunnel(query: AnalyticsQueryDto) {
    const match = this.buildMatch(query);
    const baseMatch = { ...match };
    delete baseMatch.eventType;

    const steps: FunnelStep[] = [
      {
        eventType: AnalyticsEventType.PROFILE_IMPRESSION,
        label: 'Profile Impression',
      },
      {
        eventType: AnalyticsEventType.PROFILE_VIEWED,
        label: 'Profile View',
      },
      {
        eventType: AnalyticsEventType.MATCH_REQUEST_SENT,
        label: 'Interest Sent',
      },
      {
        eventType: AnalyticsEventType.MATCH_ACCEPTED,
        label: 'Match Accepted',
      },
      {
        eventType: AnalyticsEventType.CHAT_STARTED,
        label: 'Chat Started',
      },
      {
        eventType: AnalyticsEventType.SUBSCRIPTION_PURCHASED,
        label: 'Subscription Purchased',
      },
    ];

    const userCounts = await Promise.all(
      steps.map(async (step) => {
        const users = await this.repo.distinctUsers({
          ...baseMatch,
          eventType: step.eventType,
        });
        return {
          ...step,
          users: users.filter(Boolean).length,
        };
      }),
    );

    const base = userCounts[0].users;

    return {
      steps: userCounts.map((step, index) => {
        const previous = index === 0 ? step.users : userCounts[index - 1].users;
        const conversionFromPrevious =
          previous > 0 ? Number(((step.users / previous) * 100).toFixed(2)) : 0;
        const conversionFromStart =
          base > 0 ? Number(((step.users / base) * 100).toFixed(2)) : 0;

        return {
          eventType: step.eventType,
          label: step.label,
          users: step.users,
          conversionFromPrevious,
          conversionFromStart,
        };
      }),
    };
  }

  async aggregateDailySummary(day = this.getPreviousUtcDay()) {
    const from = new Date(`${day}T00:00:00.000Z`);
    const to = new Date(`${day}T23:59:59.999Z`);
    const query = {
      from: from.toISOString(),
      to: to.toISOString(),
    } as AnalyticsQueryDto;

    const [overview, funnel] = await Promise.all([
      this.getOverview(query),
      this.getFunnel(query),
    ]);

    return this.repo.upsertDailySummary({
      day,
      from,
      to,
      overview: overview,
      funnel: funnel,
      generatedAt: new Date(),
    });
  }

  async getDailySummaries(query: AnalyticsSummaryQueryDto) {
    const limit = Math.min(Math.max(query.limit ?? 30, 1), 90);

    if (query.day) {
      const summary = await this.repo.getDailySummaryByDay(query.day);
      return {
        total: summary ? 1 : 0,
        summaries: summary ? [summary] : [],
      };
    }

    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    const summaries = await this.repo.getDailySummaries({ from, to, limit });
    return {
      total: summaries.length,
      summaries,
    };
  }

  private buildMatch(query: AnalyticsQueryDto): AnalyticsMatch {
    const match: AnalyticsMatch = {};

    if (query.eventType) {
      match.eventType = query.eventType;
    } else if (query.eventTypes && query.eventTypes.length > 0) {
      match.eventType = { $in: query.eventTypes };
    }

    if (query.from || query.to) {
      match.occurredAt = {};
      if (query.from) match.occurredAt.$gte = new Date(query.from);
      if (query.to) match.occurredAt.$lte = new Date(query.to);
    }

    if (query.platform) {
      match.platform = query.platform;
    }

    if (query.funnelStage) {
      match.funnelStage = query.funnelStage;
    }

    if (query.userId) {
      match.userId = query.userId;
    }

    if (query.source) {
      match.source = query.source;
    }

    if (query.campaign) {
      match.campaign = query.campaign;
    }

    if (query.country) {
      match.country = query.country;
    }

    if (query.city) {
      match.city = query.city;
    }

    if (typeof query.isPremium === 'boolean') {
      match.isPremium = query.isPremium;
    }

    return match;
  }

  private getGroupField(groupBy: AnalyticsGroupBy): string {
    switch (groupBy) {
      case AnalyticsGroupBy.PLATFORM:
        return '$platform';
      case AnalyticsGroupBy.SOURCE:
        return '$source';
      case AnalyticsGroupBy.CAMPAIGN:
        return '$campaign';
      case AnalyticsGroupBy.COUNTRY:
        return '$country';
      case AnalyticsGroupBy.CITY:
        return '$city';
      case AnalyticsGroupBy.FUNNEL_STAGE:
        return '$funnelStage';
      case AnalyticsGroupBy.EVENT_TYPE:
      default:
        return '$eventType';
    }
  }

  private getPreviousUtcDay() {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  }
}
