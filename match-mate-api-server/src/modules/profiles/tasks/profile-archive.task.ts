import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { ProfilesService } from '../services/profiles.service';

@Injectable()
export class ProfileArchiveTask {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  @Cron('30 2 * * *')
  async archiveInactiveProfiles() {
    try {
      const result = await this.profilesService.archiveInactiveProfiles(
        this.configService.get<number>('profiles.inactiveArchiveDays', 180),
        this.configService.get<number>('profiles.inactiveArchiveLimit', 500),
      );

      if (!result.skipped && result.modifiedCount > 0) {
        this.logger.log('Profile archive task complete', result);
      }
    } catch (err) {
      this.logger.error(
        'Profile archive task failed',
        err instanceof Error ? err.stack : undefined,
        { error: err instanceof Error ? err.message : String(err) },
      );
    }
  }
}
