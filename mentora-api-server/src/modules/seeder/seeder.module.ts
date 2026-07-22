import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Permission,
  PermissionSchema,
} from '@/modules/admin/schemas/permission.schema';
import { Role, RoleSchema } from '@/modules/admin/schemas/role.schema';
import { MasterSeederService } from './services/master-seeder.service';
import { Plan, PlanSchema } from '../subscriptions/schemas/plan.schema';
import {
  Feature,
  FeatureSchema,
} from '../subscriptions/schemas/feature.schema';
import {
  PlanFeature,
  PlanFeatureSchema,
} from '../subscriptions/schemas/plan-feature.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscriptions/schemas/subscription.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from '@/modules/notifications/schemas/notification-templates.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  Profile,
  ProfileSchema,
} from '../profiles/schemas/profile/profile.schema';
import { Media, MediaSchema } from '../profiles/schemas/media/media.schema';
import {
  AccountSetting,
  AccountSettingSchema,
} from '../settings/schemas/account-setting.schema';
import {
  PrivacySetting,
  PrivacySettingSchema,
} from '../settings/schemas/privacy-setting.schema';
import {
  NotificationSetting,
  NotificationSettingSchema,
} from '../settings/schemas/notification-setting.schema';
import {
  CommunicationSetting,
  CommunicationSettingSchema,
} from '../settings/schemas/communication-setting.schema';
import {
  SecuritySetting,
  SecuritySettingSchema,
} from '../settings/schemas/security-setting.schema';
import {
  LocalizationSetting,
  LocalizationSettingSchema,
} from '../settings/schemas/localization-setting.schema';
import {
  AccessibilitySetting,
  AccessibilitySettingSchema,
} from '../settings/schemas/accessibility-setting.schema';
import {
  MediaSetting,
  MediaSettingSchema,
} from '../settings/schemas/media-setting.schema';
import {
  AiSetting,
  AiSettingSchema,
} from '../settings/schemas/ai-setting.schema';
import { SafetyModule } from '../safety/safety.module';
import { Subject, SubjectSchema } from '../learning/schemas/learning.schemas';

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
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: NotificationTemplate.name,
        schema: NotificationTemplateSchema,
      },
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
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
      { name: Subject.name, schema: SubjectSchema },
    ]),
  ],

  providers: [MasterSeederService],

  exports: [MasterSeederService],
})
export class SeederModule {}
