import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { ProfilesController } from './controllers/profiles.controller';
import { MediaController } from './controllers/media.controller';

// Services
import { ProfilesService } from './services/profiles.service';
import { MediaService } from './services/media.service';
import { ProfileScoringService } from './services/profile-scoring.service';
import { MediaModerationService } from './services/media-moderation.service';
import { VideoThumbnailService } from './services/video-thumbnail.service';
import { MediaCleanupTask } from './tasks/media-cleanup.task';
import { ProfileArchiveTask } from './tasks/profile-archive.task';

// Repositories
import { ProfileRepository } from './repositories/profile.repository';
import { MediaRepository } from './repositories/media.repository';

// Schemas
import { Profile, ProfileSchema } from './schemas/profile/profile.schema';
import { Media, MediaSchema } from './schemas/media/media.schema';
import {
  ActivityLog,
  ActivityLogSchema,
} from './schemas/settings/activity-logs.schema';
import { SafetyModule } from '../safety/safety.module';

// External modules
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { StorageModule } from '../storage/storage.module';
import { SettingsModule } from '../settings/settings.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Media.name, schema: MediaSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
    NotificationsModule,
    AnalyticsModule,
    StorageModule,
    AuthModule,
    SettingsModule,
    SafetyModule,
    SubscriptionsModule,
    ReferralsModule,
  ],
  controllers: [ProfilesController, MediaController],
  providers: [
    NotificationsModule,
    ProfilesService,
    MediaService,
    ProfileScoringService,
    MediaModerationService,
    VideoThumbnailService,
    MediaCleanupTask,
    ProfileArchiveTask,
    ProfileRepository,
    MediaRepository,
  ],
  exports: [
    ProfilesService,
    MediaService,
    ProfileScoringService,
    MediaModerationService,
    VideoThumbnailService,
  ],
})
export class ProfilesModule {}
