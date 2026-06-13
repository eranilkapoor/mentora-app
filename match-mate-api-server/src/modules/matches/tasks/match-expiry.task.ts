import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { MatchesService } from '../services/matches.service';

@Injectable()
export class MatchExpiryTask {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  @Cron('0 1 * * *')
  async expireOverdueMatches() {
    if (!this.configService.get<boolean>('matches.expiryEnabled')) {
      return;
    }

    try {
      const result = await this.matchesService.expireOverdueMatches(
        this.configService.get<number>('matches.expiryLimit', 500),
      );

      if (result.modifiedCount > 0) {
        this.logger.log('Match expiry task complete', result);
      }
    } catch (err) {
      this.logger.error(
        'Match expiry task failed',
        err instanceof Error ? err.stack : undefined,
        { error: err instanceof Error ? err.message : String(err) },
      );
    }
  }
}
