import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Permission,
  PermissionSchema,
} from 'src/modules/admin/schemas/permission.schema';
import { Role, RoleSchema } from 'src/modules/admin/schemas/role.schema';
import { MasterSeederService } from './services/master-seeder.service';
import { Plan, PlanSchema } from '../subscription/schemas/plan.schema';
import { Feature, FeatureSchema } from '../subscription/schemas/feature.schema';
import {
  PlanFeature,
  PlanFeatureSchema,
} from '../subscription/schemas/plan-feature.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from 'src/modules/notification/schemas/notification-templates.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  Profile,
  ProfileSchema,
} from '../profile/schemas/profile/profile.schema';
import {
  Preference,
  PreferenceSchema,
} from '../profile/schemas/preference/preference.schema';
import { Media, MediaSchema } from '../profile/schemas/media/media.schema';
import {
  AccountSettings,
  AccountSettingsSchema,
} from '../settings/schemas/account-settings.schema';
import {
  PrivacySettings,
  PrivacySettingsSchema,
} from '../settings/schemas/privacy-settings.schema';
import {
  NotificationSettings,
  NotificationSettingsSchema,
} from '../settings/schemas/notification-settings.schema';
import {
  CommunicationSettings,
  CommunicationSettingsSchema,
} from '../settings/schemas/communication-settings.schema';
import {
  SecuritySettings,
  SecuritySettingsSchema,
} from '../settings/schemas/security-settings.schema';
import {
  LocalizationSettings,
  LocalizationSettingsSchema,
} from '../settings/schemas/localization-settings.schema';
import {
  AccessibilitySettings,
  AccessibilitySettingsSchema,
} from '../settings/schemas/accessibility-settings.schema';
import {
  MediaSettings,
  MediaSettingsSchema,
} from '../settings/schemas/media-settings.schema';
import {
  AiSettings,
  AiSettingsSchema,
} from '../settings/schemas/ai-settings.schema';
import { SafetyModule } from '../safety/safety.module';

@Module({
  imports: [
    SafetyModule,
    MongooseModule.forFeature([
      {
        name: Permission.name,
        schema: PermissionSchema,
      },

      {
        name: Role.name,
        schema: RoleSchema,
      },

      {
        name: Plan.name,
        schema: PlanSchema,
      },

      {
        name: Feature.name,
        schema: FeatureSchema,
      },

      {
        name: PlanFeature.name,
        schema: PlanFeatureSchema,
      },
      {
        name: NotificationTemplate.name,
        schema: NotificationTemplateSchema,
      },
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Media.name, schema: MediaSchema },
      { name: AccountSettings.name, schema: AccountSettingsSchema },
      { name: PrivacySettings.name, schema: PrivacySettingsSchema },
      { name: NotificationSettings.name, schema: NotificationSettingsSchema },
      { name: CommunicationSettings.name, schema: CommunicationSettingsSchema },
      { name: SecuritySettings.name, schema: SecuritySettingsSchema },
      { name: LocalizationSettings.name, schema: LocalizationSettingsSchema },
      { name: AccessibilitySettings.name, schema: AccessibilitySettingsSchema },
      { name: MediaSettings.name, schema: MediaSettingsSchema },
      { name: AiSettings.name, schema: AiSettingsSchema },
    ]),
  ],

  providers: [MasterSeederService],

  exports: [MasterSeederService],
})
export class SeederModule {}
