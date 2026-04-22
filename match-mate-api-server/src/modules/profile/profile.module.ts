import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { ProfileRepository } from './repositories/profile.repository';
import { Profile, ProfileSchema } from './schemas/profile/profile.schema';
import { NotificationModule } from '../notification/notification.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import {
  ActivityLog,
  ActivityLogSchema,
} from './schemas/settings/activity-logs.schema';
import {
  PrivacySetting,
  PrivacySettingSchema,
} from './schemas/settings/privacy-setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: PrivacySetting.name, schema: PrivacySettingSchema },
    ]),
    NotificationModule,
    AnalyticsModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
  exports: [ProfileService],
})
export class ProfileModule {}
