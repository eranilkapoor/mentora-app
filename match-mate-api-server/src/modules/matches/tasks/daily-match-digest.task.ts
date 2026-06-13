import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MatchDiscoveryRepository } from '../repositories/match-discovery.repository';
import { MatchDiscoveryService } from '../services/match-discovery.service';
import { MatchNotificationService } from '../services/match-notification.service';
import { AppLogger } from '@/common/logger/logger.service';

@Injectable()
export class DailyMatchDigestTask {
  constructor(
    private readonly discoveryRepo: MatchDiscoveryRepository,
    private readonly discoveryService: MatchDiscoveryService,
    private readonly notificationService: MatchNotificationService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  @Cron('0 9 * * *')
  async sendDailyMatches() {
    const enabled = this.configService.get<boolean>(
      'matches.dailyDigestEnabled',
      true,
    );
    const dryRun = this.configService.get<boolean>(
      'matches.dailyDigestDryRun',
      false,
    );
    const limit = this.configService.get<number>(
      'matches.dailyDigestLimit',
      500,
    );

    if (!enabled) {
      this.logger.log('Daily match digest skipped: task disabled');
      return { scanned: 0, eligible: 0, sent: 0, errors: 0, dryRun };
    }

    const userIds = await this.discoveryRepo.getActiveDiscoveryUserIds(limit);
    let sentCount = 0;
    let eligibleCount = 0;
    let errorCount = 0;

    for (const userId of userIds) {
      try {
        const result = await this.discoveryService.getRecommendedMatches(
          userId,
          { page: 1, limit: 5 },
        );
        const matches = Array.isArray(result.data) ? result.data : [];
        if (matches.length === 0) continue;

        eligibleCount += 1;

        if (!dryRun) {
          await this.notificationService.notifyDailyMatches(
            userId,
            matches.length,
            String(matches[0]?.userId ?? ''),
          );
          sentCount += 1;
        }
      } catch (error) {
        errorCount += 1;
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Daily match digest skipped for user ${userId}: ${message}`,
        );
      }
    }

    const summary = {
      scanned: userIds.length,
      eligible: eligibleCount,
      sent: sentCount,
      errors: errorCount,
      dryRun,
    };
    this.logger.log(`Daily match digest complete`, summary);
    return summary;
  }
}
