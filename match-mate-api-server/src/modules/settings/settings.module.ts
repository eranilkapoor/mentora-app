import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { SettingsRepository } from './repositories/settings.repository';
import {
  AccountSetting,
  AccountSettingSchema,
} from './schemas/account-setting.schema';
import {
  PrivacySetting,
  PrivacySettingSchema,
} from './schemas/privacy-setting.schema';
import {
  NotificationSetting,
  NotificationSettingSchema,
} from './schemas/notification-setting.schema';
import {
  CommunicationSetting,
  CommunicationSettingSchema,
} from './schemas/communication-setting.schema';
import {
  SecuritySetting,
  SecuritySettingSchema,
} from './schemas/security-setting.schema';
import {
  LocalizationSetting,
  LocalizationSettingSchema,
} from './schemas/localization-setting.schema';
import {
  AccessibilitySetting,
  AccessibilitySettingSchema,
} from './schemas/accessibility-setting.schema';
import {
  MediaSetting,
  MediaSettingSchema,
} from './schemas/media-setting.schema';
import { AiSetting, AiSettingSchema } from './schemas/ai-setting.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  UserSession,
  UserSessionSchema,
} from '../auth/schemas/user-session.schema';
import { SafetyModule } from '../safety/safety.module';
import {
  Profile,
  ProfileSchema,
} from '../profiles/schemas/profile/profile.schema';
import { Media, MediaSchema } from '../profiles/schemas/media/media.schema';
import { ChatRealtimeModule } from '../chat/chat-realtime.module';

@Module({
  imports: [
    SafetyModule,
    ChatRealtimeModule,
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
