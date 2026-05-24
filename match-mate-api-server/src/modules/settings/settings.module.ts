import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { SettingsRepository } from './repositories/settings.repository';
import {
  AccountSettings,
  AccountSettingsSchema,
} from './schemas/account-settings.schema';
import {
  PrivacySettings,
  PrivacySettingsSchema,
} from './schemas/privacy-settings.schema';
import {
  NotificationSettings,
  NotificationSettingsSchema,
} from './schemas/notification-settings.schema';
import {
  CommunicationSettings,
  CommunicationSettingsSchema,
} from './schemas/communication-settings.schema';
import {
  SecuritySettings,
  SecuritySettingsSchema,
} from './schemas/security-settings.schema';
import {
  LocalizationSettings,
  LocalizationSettingsSchema,
} from './schemas/localization-settings.schema';
import {
  AccessibilitySettings,
  AccessibilitySettingsSchema,
} from './schemas/accessibility-settings.schema';
import {
  MediaSettings,
  MediaSettingsSchema,
} from './schemas/media-settings.schema';
import { AiSettings, AiSettingsSchema } from './schemas/ai-settings.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  UserSession,
  UserSessionSchema,
} from '../auth/schemas/user-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountSettings.name, schema: AccountSettingsSchema },
      { name: PrivacySettings.name, schema: PrivacySettingsSchema },
      { name: NotificationSettings.name, schema: NotificationSettingsSchema },
      { name: CommunicationSettings.name, schema: CommunicationSettingsSchema },
      { name: SecuritySettings.name, schema: SecuritySettingsSchema },
      { name: LocalizationSettings.name, schema: LocalizationSettingsSchema },
      { name: AccessibilitySettings.name, schema: AccessibilitySettingsSchema },
      { name: MediaSettings.name, schema: MediaSettingsSchema },
      { name: AiSettings.name, schema: AiSettingsSchema },
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService],
})
export class SettingsModule {}
