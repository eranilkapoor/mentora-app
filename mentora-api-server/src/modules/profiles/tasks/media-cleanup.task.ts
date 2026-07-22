import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AppLogger } from '@/common/logger/logger.service';
import { MediaService } from '../services/media.service';

@Injectable()
export class MediaCleanupTask {
  constructor(
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  @Cron('0 3 * * *')
  async cleanupDeletedMedia() {
    try {
      const result = await this.mediaService.cleanupDeletedMedia(
        this.configService.get<number>('media.deletedCleanupRetentionDays', 7),
        this.configService.get<number>('media.deletedCleanupLimit', 100),
      );

      if (result.scannedCount > 0 || result.failedMediaIds.length > 0) {
        this.logger.log('Media cleanup task complete', result);
      }
    } catch (err) {
      this.logger.error(
        'Media cleanup task failed',
        err instanceof Error ? err.stack : undefined,
        { error: err instanceof Error ? err.message : String(err) },
      );
    }
  }
}
