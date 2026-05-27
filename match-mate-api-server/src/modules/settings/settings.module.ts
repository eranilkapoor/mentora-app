import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { SettingsRepository } from './repositories/settings.repository';
import {
  AccountSetting,
  AccountSettingSchema,
} from './schemas/account-settings.schema';
import {
  PrivacySetting,
  PrivacySettingSchema,
} from './schemas/privacy-settings.schema';
import {
  NotificationSetting,
  NotificationSettingSchema,
} from './schemas/notification-settings.schema';
import {
  CommunicationSetting,
  CommunicationSettingSchema,
} from './schemas/communication-settings.schema';
import {
  SecuritySetting,
  SecuritySettingSchema,
} from './schemas/security-settings.schema';
import {
  LocalizationSetting,
  LocalizationSettingSchema,
} from './schemas/localization-settings.schema';
import {
  AccessibilitySetting,
  AccessibilitySettingSchema,
} from './schemas/accessibility-settings.schema';
import {
  MediaSetting,
  MediaSettingSchema,
} from './schemas/media-settings.schema';
import { AiSetting, AiSettingSchema } from './schemas/ai-settings.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  UserSession,
  UserSessionSchema,
} from '../auth/schemas/user-session.schema';
import { SafetyModule } from '../safety/safety.module';
import {
  Profile,
  ProfileSchema,
} from '../profile/schemas/profile/profile.schema';
import { Media, MediaSchema } from '../profile/schemas/media/media.schema';

@Module({
  imports: [
    SafetyModule,
    MongooseModule.forFeature([
      { name: AccountSetting.name, schema: AccountSettingSchema },
      { name: PrivacySetting.name, schema: PrivacySettingSchema },
      { name: NotificationSetting.name, schema: NotificationSettingSchema },
      { name: CommunicationSetting.name, schema: CommunicationSettingSchema },
      { name: SecuritySetting.name, schema: SecuritySettingSchema },
      { name: LocalizationSetting.name, schema: LocalizationSettingSchema },
      { name: AccessibilitySetting.name, schema: AccessibilitySettingSchema },
      { name: MediaSetting.name, schema: MediaSettingSchema },
      { name: AiSetting.name, schema: AiSettingSchema },
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService],
})
export class SettingsModule {}
