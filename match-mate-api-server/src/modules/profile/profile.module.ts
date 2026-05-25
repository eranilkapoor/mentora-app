import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { ProfileController } from './controllers/profile.controller';
import { MediaController } from './controllers/media.controller';
import { PreferenceController } from './controllers/preference.controller';

// Services
import { ProfileService } from './services/profile.service';
import { MediaService } from './services/media.service';
import { PreferenceService } from './services/preference.service';

// Repositories
import { ProfileRepository } from './repositories/profile.repository';
import { MediaRepository } from './repositories/media.repository';
import { PreferenceRepository } from './repositories/preference.repository';

// Schemas
import { Profile, ProfileSchema } from './schemas/profile/profile.schema';
import { Media, MediaSchema } from './schemas/media/media.schema';
import {
  Preference,
  PreferenceSchema,
} from './schemas/preference/preference.schema';
import {
  ActivityLog,
  ActivityLogSchema,
} from './schemas/settings/activity-logs.schema';
import {
  PrivacySetting,
  PrivacySettingSchema,
} from './schemas/settings/privacy-setting.schema';
import {
  Verification,
  VerificationSchema,
} from './schemas/settings/verification.schema';

// External modules
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { StorageModule } from '../storage/storage.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: PrivacySetting.name, schema: PrivacySettingSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),
    NotificationModule,
    AnalyticsModule,
    StorageModule,
    AuthModule,
    SettingsModule,
  ],
  controllers: [ProfileController, MediaController, PreferenceController],
  providers: [
    AuthModule,
    ProfileService,
    MediaService,
    PreferenceService,
    ProfileRepository,
    MediaRepository,
    PreferenceRepository,
  ],
  exports: [ProfileService, MediaService, PreferenceService],
})
export class ProfileModule {}
