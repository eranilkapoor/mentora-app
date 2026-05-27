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
  AccountSetting,
  AccountSettingSchema,
} from '../settings/schemas/account-settings.schema';
import {
  PrivacySetting,
  PrivacySettingSchema,
} from '../settings/schemas/privacy-settings.schema';
import {
  NotificationSetting,
  NotificationSettingSchema,
} from '../settings/schemas/notification-settings.schema';
import {
  CommunicationSetting,
  CommunicationSettingSchema,
} from '../settings/schemas/communication-settings.schema';
import {
  SecuritySetting,
  SecuritySettingSchema,
} from '../settings/schemas/security-settings.schema';
import {
  LocalizationSetting,
  LocalizationSettingSchema,
} from '../settings/schemas/localization-settings.schema';
import {
  AccessibilitySetting,
  AccessibilitySettingSchema,
} from '../settings/schemas/accessibility-settings.schema';
import {
  MediaSetting,
  MediaSettingSchema,
} from '../settings/schemas/media-settings.schema';
import {
  AiSetting,
  AiSettingSchema,
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
      { name: AccountSetting.name, schema: AccountSettingSchema },
      { name: PrivacySetting.name, schema: PrivacySettingSchema },
      { name: NotificationSetting.name, schema: NotificationSettingSchema },
      { name: CommunicationSetting.name, schema: CommunicationSettingSchema },
      { name: SecuritySetting.name, schema: SecuritySettingSchema },
      { name: LocalizationSetting.name, schema: LocalizationSettingSchema },
      { name: AccessibilitySetting.name, schema: AccessibilitySettingSchema },
      { name: MediaSetting.name, schema: MediaSettingSchema },
      { name: AiSetting.name, schema: AiSettingSchema },
    ]),
  ],

  providers: [MasterSeederService],

  exports: [MasterSeederService],
})
export class SeederModule {}
