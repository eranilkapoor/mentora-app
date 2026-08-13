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
  StudentProfile,
  StudentProfileSchema,
} from '../learning/schemas/learning.schemas';
import { Media, MediaSchema } from '../../common/schemas/user-media.schema';
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
import {
  AcademicBoard,
  AcademicBoardSchema,
  AcademicLevel,
  AcademicLevelSchema,
  Curriculum,
  CurriculumSchema,
  Grade,
  GradeSchema,
  StudyPlan,
  StudyPlanSchema,
  Subject,
  SubjectSchema,
  Topic,
  TopicSchema,
} from '../learning/schemas/learning.schemas';
import {
  Branch,
  BranchSchema,
  Department,
  DepartmentSchema,
  Team,
  TeamSchema,
} from '../organizations/schemas/organization-structure.schema';
import {
  Organization,
  OrganizationSchema,
} from '../organizations/schemas/organization.schema';
import {
  LeadSource,
  LeadSourceSchema,
  LeadStage,
  LeadStageSchema,
} from '@/common/crm/schemas/crm-taxonomy.schema';
import {
  UserMembership,
  UserMembershipSchema,
} from '../contexts/schemas/contexts.schema';
import {
  ModuleRecord,
  ModuleRecordSchema,
} from '../module-records/schemas/module-records.schema';

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
      { name: StudentProfile.name, schema: StudentProfileSchema },
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
      { name: AcademicBoard.name, schema: AcademicBoardSchema },
      { name: AcademicLevel.name, schema: AcademicLevelSchema },
      { name: Grade.name, schema: GradeSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: Curriculum.name, schema: CurriculumSchema },
      { name: StudyPlan.name, schema: StudyPlanSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Team.name, schema: TeamSchema },
      { name: LeadSource.name, schema: LeadSourceSchema },
      { name: LeadStage.name, schema: LeadStageSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
      { name: ModuleRecord.name, schema: ModuleRecordSchema },
    ]),
  ],

  providers: [MasterSeederService],

  exports: [MasterSeederService],
})
export class SeederModule {}
