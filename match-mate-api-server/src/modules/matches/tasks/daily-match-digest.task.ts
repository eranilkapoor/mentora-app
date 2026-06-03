import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
    private readonly logger: AppLogger,
  ) {}

  @Cron('0 9 * * *')
  async sendDailyMatches(): Promise<void> {
    const userIds = await this.discoveryRepo.getActiveDiscoveryUserIds();
    let sentCount = 0;

    for (const userId of userIds) {
      try {
        const result = await this.discoveryService.getRecommendedMatches(
          userId,
          { page: 1, limit: 5 },
        );
        const matches = Array.isArray(result.data) ? result.data : [];
        if (matches.length === 0) continue;

        await this.notificationService.notifyDailyMatches(
          userId,
          matches.length,
          String(matches[0]?.userId ?? ''),
        );
        sentCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Daily match digest skipped for user ${userId}: ${message}`,
        );
      }
    }

    this.logger.log(`Daily match digest complete. Sent: ${sentCount}`);
  }
}
