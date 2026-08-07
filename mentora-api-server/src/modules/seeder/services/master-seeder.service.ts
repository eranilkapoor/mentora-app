import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { AppLogger } from '@/common/logger/logger.service';

import {
  Permission,
  PermissionDocument,
} from '@/modules/admin/schemas/permission.schema';
import { Role, RoleDocument } from '@/modules/admin/schemas/role.schema';
import {
  Permission as AppPermission,
  Role as AppRole,
  Country,
  FeatureKey,
  Gender,
  MediaType,
  MimeType,
  PlanTier,
  ProfileStatus,
  Qualification,
  Religion,
  Status,
  SubscriptionStatus,
} from '@/common/enums';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  Profile,
  ProfileDocument,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  Media,
  MediaDocument,
} from '@/modules/profiles/schemas/media/media.schema';
import { MediaStatus } from '@/modules/profiles/enums/profile-media.enums';
import {
  AccountSetting,
  AccountSettingDocument,
} from '@/modules/settings/schemas/account-setting.schema';
import {
  PrivacySetting,
  PrivacySettingDocument,
} from '@/modules/settings/schemas/privacy-setting.schema';
import {
  NotificationSetting,
  NotificationSettingDocument,
} from '@/modules/settings/schemas/notification-setting.schema';
import {
  CommunicationSetting,
  CommunicationSettingDocument,
} from '@/modules/settings/schemas/communication-setting.schema';
import {
  SecuritySetting,
  SecuritySettingDocument,
} from '@/modules/settings/schemas/security-setting.schema';
import {
  LocalizationSetting,
  LocalizationSettingDocument,
} from '@/modules/settings/schemas/localization-setting.schema';
import {
  AccessibilitySetting,
  AccessibilitySettingDocument,
} from '@/modules/settings/schemas/accessibility-setting.schema';
import {
  MediaSetting,
  MediaSettingDocument,
} from '@/modules/settings/schemas/media-setting.schema';
import {
  AiSetting,
  AiSettingDocument,
} from '@/modules/settings/schemas/ai-setting.schema';
import {
  Verification,
  VerificationDocument,
} from '@/modules/safety/schemas/verification.schema';
import {
  VerificationProvider,
  VerificationStatus,
} from '@/modules/safety/enums/verification.enums';
import {
  Plan,
  PlanDocument,
} from '@/modules/subscriptions/schemas/plan.schema';
import {
  Feature,
  FeatureDocument,
} from '@/modules/subscriptions/schemas/feature.schema';
import {
  PlanFeature,
  PlanFeatureDocument,
} from '@/modules/subscriptions/schemas/plan-feature.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '@/modules/subscriptions/schemas/subscription.schema';
import {
  NotificationTemplate,
  NotificationTemplateDocument,
} from '@/modules/notifications/schemas/notification-templates.schema';
import {
  AcademicBoard,
  AcademicBoardDocument,
  AcademicLevel,
  AcademicLevelDocument,
  Curriculum,
  CurriculumDocument,
  Grade,
  GradeDocument,
  StudyPlan,
  StudyPlanDocument,
  Subject,
  SubjectDocument,
  Topic,
  TopicDocument,
} from '@/modules/learning/schemas/learning.schemas';
import {
  Branch,
  BranchDocument,
  Department,
  DepartmentDocument,
  Team,
  TeamDocument,
} from '@/modules/organizations/schemas/organization-structure.schema';
import {
  Organization,
  OrganizationDocument,
} from '@/modules/organizations/schemas/organization.schema';
import {
  LeadSource,
  LeadSourceDocument,
  LeadStage,
  LeadStageDocument,
} from '@/common/crm/schemas/crm-taxonomy.schema';
import {
  UserMembership,
  UserMembershipDocument,
} from '@/modules/contexts/schemas/contexts.schema';
import {
  ModuleRecord,
  ModuleRecordDocument,
} from '@/modules/module-records/schemas/module-records.schema';
import {
  EDUCATION_PLATFORM_MODULE_KEYS,
  EDUCATION_PLATFORM_USER_ROLES,
} from '@/common/constants/education-platform.constants';
import {
  FEATURE_SEEDS,
  CUSTOM_ASSISTED_FEATURE_MAPPINGS,
  FIXED_PLAN_LIMITS,
  NOTIFICATION_TEMPLATE_SEEDS,
  PLAN_SEEDS,
  ROLE_PERMISSION_POLICIES,
  resolveRolePermissions,
} from '../data';

const PLAY_REVIEWER_EMAIL = 'reviewer@webnza.com';
const PLAY_REVIEWER_PASSWORD = 'Test@123456#';
const PLAY_PHONE_REVIEWER_EMAIL = 'phone-reviewer@webnza.com';
const PLAY_PHONE_REVIEWER_COUNTRY_CODE = '91';
const PLAY_PHONE_REVIEWER_PHONE = '9876543210';
const SEED_PASSWORD = 'Test@125#';

@Injectable()
export class MasterSeederService {
  constructor(
    private readonly logger: AppLogger,

    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,

    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,

    @InjectModel(Plan.name)
    private readonly planModel: Model<PlanDocument>,

    @InjectModel(Feature.name)
    private readonly featureModel: Model<FeatureDocument>,

    @InjectModel(PlanFeature.name)
    private readonly planFeatureModel: Model<PlanFeatureDocument>,

    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,

    @InjectModel(NotificationTemplate.name)
    private readonly notificationTemplateModel: Model<NotificationTemplateDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,

    @InjectModel(AccountSetting.name)
    private readonly accountSettingsModel: Model<AccountSettingDocument>,

    @InjectModel(PrivacySetting.name)
    private readonly privacySettingsModel: Model<PrivacySettingDocument>,

    @InjectModel(NotificationSetting.name)
    private readonly notificationSettingsModel: Model<NotificationSettingDocument>,

    @InjectModel(CommunicationSetting.name)
    private readonly communicationSettingsModel: Model<CommunicationSettingDocument>,

    @InjectModel(SecuritySetting.name)
    private readonly securitySettingsModel: Model<SecuritySettingDocument>,

    @InjectModel(LocalizationSetting.name)
    private readonly localizationSettingsModel: Model<LocalizationSettingDocument>,

    @InjectModel(AccessibilitySetting.name)
    private readonly accessibilitySettingsModel: Model<AccessibilitySettingDocument>,

    @InjectModel(MediaSetting.name)
    private readonly mediaSettingsModel: Model<MediaSettingDocument>,

    @InjectModel(AiSetting.name)
    private readonly aiSettingsModel: Model<AiSettingDocument>,

    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,

    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,

    @InjectModel(AcademicBoard.name)
    private readonly academicBoardModel: Model<AcademicBoardDocument>,

    @InjectModel(AcademicLevel.name)
    private readonly academicLevelModel: Model<AcademicLevelDocument>,

    @InjectModel(Grade.name)
    private readonly gradeModel: Model<GradeDocument>,

    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,

    @InjectModel(Curriculum.name)
    private readonly curriculumModel: Model<CurriculumDocument>,

    @InjectModel(StudyPlan.name)
    private readonly studyPlanModel: Model<StudyPlanDocument>,

    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,

    @InjectModel(Branch.name)
    private readonly branchModel: Model<BranchDocument>,

    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,

    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,

    @InjectModel(LeadSource.name)
    private readonly leadSourceModel: Model<LeadSourceDocument>,

    @InjectModel(LeadStage.name)
    private readonly leadStageModel: Model<LeadStageDocument>,

    @InjectModel(UserMembership.name)
    private readonly userMembershipModel: Model<UserMembershipDocument>,

    @InjectModel(ModuleRecord.name)
    private readonly moduleRecordModel: Model<ModuleRecordDocument>,
  ) {}

  // MASTER RUNNER
  // =========================================================

  async run() {
    this.logger.log('Starting master seeder');

    await this.seedPermissions();
    await this.seedRoles();
    await this.seedRoleTestUsers();
    await this.seedFeatures();
    await this.seedPlans();
    await this.seedPlanFeatures();
    await this.seedDefaultTemplates();
    await this.seedMentoraAcademicCatalog();
    await this.seedEducationCrmDemoData();
    await this.seedUserSubscriptions();

    this.logger.log('Master seeder completed');
  }

  // =========================================================
  // MENTORA ACADEMIC CATALOG
  // =========================================================

  private async seedMentoraAcademicCatalog() {
    const now = new Date();
    const board = {
      name: 'Central Board of Secondary Education',
      code: 'CBSE',
      country: 'India',
      type: 'school',
      status: 'active',
    };
    const level = {
      name: 'Middle and Secondary School',
      code: 'SCHOOL_6_10',
      sortOrder: 10,
      status: 'active',
    };
    const grades = [6, 7, 8, 9, 10].map((grade) => ({
      name: `Class ${grade}`,
      code: `class-${grade}`,
      sortOrder: grade,
      status: 'active',
    }));
    const subjects = [
      {
        name: 'Mathematics',
        code: 'MATH',
        category: 'core',
        gradeIds: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
        description:
          'MVP mathematics subject for Classes 6-10 AI tutoring, practice, and assessment.',
      },
      {
        name: 'Science',
        code: 'SCI',
        category: 'core',
        gradeIds: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
        description:
          'MVP science subject for Classes 6-10 AI tutoring, practice, and assessment.',
      },
      {
        name: 'English',
        code: 'ENG',
        category: 'language',
        gradeIds: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
        description:
          'MVP English subject for Classes 6-10 AI tutoring, reading, writing, and grammar.',
      },
    ];
    const topicsBySubject: Record<string, string[]> = {
      MATH: ['Numbers', 'Algebra', 'Geometry', 'Mensuration', 'Data Handling'],
      SCI: ['Physics Basics', 'Chemistry Basics', 'Biology', 'Environment'],
      ENG: ['Reading', 'Writing', 'Grammar', 'Vocabulary'],
    };

    await this.academicBoardModel.updateOne(
      { code: board.code },
      { $set: { ...board, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
    await this.academicLevelModel.updateOne(
      { code: level.code },
      { $set: { ...level, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );

    const [seededBoard, seededLevel] = await Promise.all([
      this.academicBoardModel.findOne({ code: board.code }).lean(),
      this.academicLevelModel.findOne({ code: level.code }).lean(),
    ]);
    if (!seededLevel) {
      throw new Error('Academic level seed failed');
    }

    await this.gradeModel.bulkWrite(
      grades.map((grade) => ({
        updateOne: {
          filter: { code: grade.code },
          update: {
            $set: {
              ...grade,
              academicLevelId: seededLevel._id,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    await this.subjectModel.bulkWrite(
      subjects.map((subject) => ({
        updateOne: {
          filter: { code: subject.code },
          update: {
            $set: {
              ...subject,
              status: 'active',
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    const seededSubjects = await this.subjectModel
      .find({ code: { $in: subjects.map((subject) => subject.code) } })
      .lean();
    const subjectByCode = new Map(
      seededSubjects.map((subject) => [subject.code, subject]),
    );
    const subjectIds = (...codes: string[]) =>
      codes
        .map((code) => subjectByCode.get(code)?._id)
        .filter((id): id is Types.ObjectId => Boolean(id));
    const seededGrades = await this.gradeModel
      .find({ code: { $in: grades.map((grade) => grade.code) } })
      .lean();
    const topicWrites = Object.entries(topicsBySubject).flatMap(
      ([subjectCode, topicNames]) => {
        const subject = subjectByCode.get(subjectCode);
        if (!subject) return [];
        return topicNames.map((name, index) => ({
          updateOne: {
            filter: {
              subjectId: subject._id,
              code: `${subjectCode}_${index + 1}`,
            },
            update: {
              $set: {
                subjectId: subject._id,
                name,
                code: `${subjectCode}_${index + 1}`,
                gradeIds: subjects.find((item) => item.code === subjectCode)
                  ?.gradeIds,
                sortOrder: index + 1,
                status: 'active',
                updatedAt: now,
              },
              $setOnInsert: { createdAt: now },
            },
            upsert: true,
          },
        }));
      },
    );
    if (topicWrites.length) {
      await this.topicModel.bulkWrite(topicWrites, { ordered: false });
    }

    const seededTopics = await this.topicModel
      .find({
        subjectId: { $in: seededSubjects.map((subject) => subject._id) },
      })
      .lean();
    const topicIdsBySubjectId = seededTopics.reduce<
      Record<string, Types.ObjectId[]>
    >((acc, topic) => {
      const key = String(topic.subjectId);
      acc[key] = [...(acc[key] ?? []), topic._id];
      return acc;
    }, {});

    const curriculumWrites = seededGrades.flatMap((grade) =>
      seededSubjects.map((subject) => ({
        updateOne: {
          filter: {
            boardId: seededBoard?._id,
            gradeId: grade._id,
            subjectId: subject._id,
          },
          update: {
            $set: {
              boardId: seededBoard?._id,
              gradeId: grade._id,
              subjectId: subject._id,
              topicIds: topicIdsBySubjectId[String(subject._id)] ?? [],
              code: `${board.code}_${grade.code}_${subject.code}`.toUpperCase(),
              status: 'active',
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
    );
    if (curriculumWrites.length) {
      await this.curriculumModel.bulkWrite(curriculumWrites, {
        ordered: false,
      });
    }

    const studyPlans = [
      {
        name: 'JEE Foundation',
        code: 'JEE_FOUNDATION',
        category: 'competitive_exam',
        target: 'jee',
        subjectIds: subjectIds('MATH', 'SCI'),
        tutorTypes: ['ai', 'human'],
        deliveryModes: ['chat', 'audio', 'video'],
        scheduleFrequency: 'weekly',
        sessionsPerWeek: 5,
        sessionDurationMinutes: 60,
        maxConcurrentSessions: 1,
        maxDevicesPerStudent: 1,
        includedAiMinutes: 1200,
        includedHumanTutorMinutes: 240,
        description:
          'Structured JEE preparation path with Mathematics and Science foundation support.',
      },
      {
        name: 'NEET Foundation',
        code: 'NEET_FOUNDATION',
        category: 'competitive_exam',
        target: 'neet',
        subjectIds: subjectIds('SCI'),
        tutorTypes: ['ai', 'human'],
        deliveryModes: ['chat', 'audio', 'video'],
        scheduleFrequency: 'weekly',
        sessionsPerWeek: 5,
        sessionDurationMinutes: 60,
        maxConcurrentSessions: 1,
        maxDevicesPerStudent: 1,
        includedAiMinutes: 1200,
        includedHumanTutorMinutes: 240,
        description:
          'Structured NEET preparation path for Science concepts, practice, and revision.',
      },
      {
        name: 'UPSC/NDA Readiness',
        code: 'UPSC_NDA_READINESS',
        category: 'competitive_exam',
        target: 'upsc',
        subjectIds: subjectIds('ENG', 'SCI'),
        tutorTypes: ['ai', 'human'],
        deliveryModes: ['chat', 'audio', 'video'],
        scheduleFrequency: 'weekly',
        sessionsPerWeek: 4,
        sessionDurationMinutes: 60,
        maxConcurrentSessions: 1,
        maxDevicesPerStudent: 1,
        includedAiMinutes: 900,
        includedHumanTutorMinutes: 180,
        description:
          'General studies, English, reasoning, and mentorship path for UPSC/NDA readiness.',
      },
      {
        name: 'Olympiad and Board Excellence',
        code: 'OLYMPIAD_BOARD_EXCELLENCE',
        category: 'school',
        target: 'olympiad',
        subjectIds: subjectIds('MATH', 'SCI', 'ENG'),
        tutorTypes: ['ai'],
        deliveryModes: ['chat', 'audio'],
        scheduleFrequency: 'weekly',
        sessionsPerWeek: 3,
        sessionDurationMinutes: 45,
        maxConcurrentSessions: 1,
        maxDevicesPerStudent: 1,
        includedAiMinutes: 720,
        includedHumanTutorMinutes: 0,
        description:
          'School-aligned practice, olympiad drills, tests, and revision for Classes 6-10.',
      },
      {
        name: 'Skill Builder',
        code: 'SKILL_BUILDER',
        category: 'skill_course',
        target: 'skill',
        subjectIds: subjectIds('ENG'),
        tutorTypes: ['ai'],
        deliveryModes: ['chat', 'audio'],
        scheduleFrequency: 'weekly',
        sessionsPerWeek: 2,
        sessionDurationMinutes: 45,
        maxConcurrentSessions: 1,
        maxDevicesPerStudent: 1,
        includedAiMinutes: 480,
        includedHumanTutorMinutes: 0,
        description:
          'Communication, English, and practical learning skills path for students.',
      },
    ];
    await this.studyPlanModel.bulkWrite(
      studyPlans.map((studyPlan) => ({
        updateOne: {
          filter: { code: studyPlan.code },
          update: {
            $set: {
              ...studyPlan,
              publiclyVisible: true,
              status: 'active',
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    this.logger.log('Mentora academic catalog seeded successfully', {
      boards: 1,
      academicLevels: 1,
      grades: grades.length,
      subjects: subjects.length,
      topics: topicWrites.length,
      curriculums: curriculumWrites.length,
      studyPlans: studyPlans.length,
    });
  }

  // =========================================================
  // MENTORA EDUCATION CRM DEMO DATA
  // =========================================================

  private async seedEducationCrmDemoData() {
    const now = new Date();
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const organizations = [
      {
        name: 'Mentora Academy',
        code: 'MENTORA-ACADEMY',
        type: 'edtech',
        slug: 'academy',
        branches: [
          ['Delhi Learning Hub', 'DELHI', 'Delhi', 'Delhi'],
          ['Noida Mentorship Center', 'NOIDA', 'Noida', 'Uttar Pradesh'],
          ['Gurugram Success Center', 'GURUGRAM', 'Gurugram', 'Haryana'],
        ],
      },
      {
        name: 'Northstar School Network',
        code: 'NORTHSTAR-SCHOOL',
        type: 'school',
        slug: 'northstar',
        branches: [
          ['Pune Branch', 'PUNE', 'Pune', 'Maharashtra'],
          ['Mumbai Branch', 'MUMBAI', 'Mumbai', 'Maharashtra'],
        ],
      },
      {
        name: 'FutureEdge College Prep',
        code: 'FUTUREEDGE-PREP',
        type: 'coaching',
        slug: 'futureedge',
        branches: [
          ['Bengaluru Prep Center', 'BENGALURU', 'Bengaluru', 'Karnataka'],
          ['Hyderabad Prep Center', 'HYDERABAD', 'Hyderabad', 'Telangana'],
          ['Chennai Prep Center', 'CHENNAI', 'Chennai', 'Tamil Nadu'],
        ],
      },
    ];

    let branchCount = 0;
    let userCount = 0;
    let membershipCount = 0;
    let moduleRecordCount = 0;

    for (const seedOrganization of organizations) {
      const organization = await this.organizationModel.findOneAndUpdate(
        { code: seedOrganization.code },
        {
          $set: {
            name: seedOrganization.name,
            code: seedOrganization.code,
            type: seedOrganization.type,
            status: 'active',
            primaryDomain: 'mentora.test',
            timezone: 'Asia/Kolkata',
            currency: 'INR',
            settings: {
              seeded: true,
              source: 'master-seeder',
              supportEmail: `support.${seedOrganization.slug}@mentora.test`,
            },
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { new: true, upsert: true },
      );

      const branchDocs: BranchDocument[] = [];
      for (const [name, code, city, state] of seedOrganization.branches) {
        const branch = await this.branchModel.findOneAndUpdate(
          { organizationId: organization._id, code },
          {
            $set: {
              organizationId: organization._id,
              name,
              code,
              city,
              state,
              status: 'active',
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          { new: true, upsert: true },
        );
        branchDocs.push(branch);
      }
      branchCount += branchDocs.length;

      await this.seedCrmDepartmentsAndTeams(organization._id, branchDocs, now);
      await this.seedCrmSourcesAndStages(organization._id, now);
      moduleRecordCount += await this.seedCrmModuleRecords(
        organization._id,
        now,
        branchDocs[0]?.name ?? seedOrganization.name,
      );

      const result = await this.seedCrmOrganizationUsers(
        organization._id,
        branchDocs,
        seedOrganization.slug,
        passwordHash,
        now,
      );
      userCount += result.users;
      membershipCount += result.memberships;
    }

    this.logger.log('Mentora education CRM organizations seeded successfully', {
      organizations: organizations.length,
      branches: branchCount,
      users: userCount,
      memberships: membershipCount,
      moduleRecords: moduleRecordCount,
      loginDomain: 'mentora.test',
      password: SEED_PASSWORD,
    });
  }

  private async seedCrmDepartmentsAndTeams(
    organizationId: Types.ObjectId,
    branches: BranchDocument[],
    now: Date,
  ) {
    const departmentSeeds: Array<[string, string, string]> = [
      ['Admissions', 'ADMISSIONS', 'admissions'],
      ['Sales', 'SALES', 'sales'],
      ['Marketing', 'MARKETING', 'marketing'],
      ['Finance', 'FINANCE', 'finance'],
      ['Academics', 'ACADEMICS', 'academics'],
      ['Operations', 'OPS', 'operations'],
    ];

    const departments: DepartmentDocument[] = [];
    for (const [name, code, departmentFunction] of departmentSeeds) {
      const department = await this.departmentModel.findOneAndUpdate(
        { organizationId, code },
        {
          $set: {
            organizationId,
            name,
            code,
            branchId: branches[0]?._id,
            function: departmentFunction,
            status: 'active',
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { new: true, upsert: true },
      );
      departments.push(department);
    }

    await this.teamModel.bulkWrite(
      departments.map((department) => ({
        updateOne: {
          filter: { organizationId, code: `${department.code}_TEAM` },
          update: {
            $set: {
              organizationId,
              departmentId: department._id,
              name: `${department.name} Team`,
              code: `${department.code}_TEAM`,
              status: 'active',
              capacityRules: {
                dailyLeadLimit: department.function === 'admissions' ? 60 : 40,
                escalationHours: department.function === 'finance' ? 24 : 12,
              },
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  private async seedCrmOrganizationUsers(
    organizationId: Types.ObjectId,
    branches: BranchDocument[],
    organizationSlug: string,
    passwordHash: string,
    now: Date,
  ) {
    let users = 0;
    let memberships = 0;
    const allBranchIds = branches.map((branch) => branch._id);

    for (const [index, role] of EDUCATION_PLATFORM_USER_ROLES.entries()) {
      const email = `${organizationSlug}.${role.replace(/_/g, '.')}@mentora.test`;
      const branchIds = this.resolveSeededRoleBranchIds(
        role,
        allBranchIds,
        index,
      );
      const systemRole = this.mapCrmRoleToAppRole(role);

      const user = await this.userModel.findOneAndUpdate(
        { email },
        {
          $set: {
            email,
            status: Status.ACTIVE,
            isEmailVerified: true,
            isPhoneVerified: false,
            isOnboardingCompleted: true,
            roles: [systemRole],
            permissions: [],
            authAccounts: [
              {
                provider: AuthProvider.EMAIL,
                providerId: email,
                passwordHash,
                isVerified: true,
                isPrimary: true,
                lastUsedAt: now,
              },
            ],
            lastLoginAt: now,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { new: true, upsert: true },
      );

      await this.userMembershipModel.updateOne(
        { userId: user._id, organizationId, role },
        {
          $set: {
            userId: user._id,
            organizationId,
            role,
            branchIds,
            permissions: [],
            status: 'active',
            settings: {
              seeded: true,
              defaultOrganizationContext: true,
              loginEmail: email,
            },
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );

      users += 1;
      memberships += 1;
    }

    return { users, memberships };
  }

  private resolveSeededRoleBranchIds(
    role: string,
    branchIds: Types.ObjectId[],
    index: number,
  ) {
    if (
      [
        'super_admin',
        'organization_admin',
        'finance',
        'parent',
        'student',
      ].includes(role)
    ) {
      return branchIds;
    }

    const branchId = branchIds[index % Math.max(branchIds.length, 1)];
    return branchId ? [branchId] : [];
  }

  private mapCrmRoleToAppRole(role: string) {
    if (role === 'super_admin') {
      return AppRole.SUPER_ADMIN;
    }
    if (role === 'finance') {
      return AppRole.FINANCE;
    }
    if (role === 'marketing_executive') {
      return AppRole.MARKETING_ADMIN;
    }
    if (role === 'student') {
      return AppRole.STUDENT;
    }
    if (role === 'parent') {
      return AppRole.PARENT;
    }
    return AppRole.ADMIN;
  }

  private async seedCrmSourcesAndStages(
    organizationId: Types.ObjectId,
    now: Date,
  ) {
    const sources: Array<[string, string, string]> = [
      ['Website', 'WEBSITE', 'website'],
      ['WhatsApp', 'WHATSAPP', 'whatsapp'],
      ['Google Ads', 'GOOGLE_ADS', 'google'],
      ['Referral', 'REFERRAL', 'referral'],
    ];

    await this.leadSourceModel.bulkWrite(
      sources.map(([name, code, category]) => ({
        updateOne: {
          filter: { organizationId, code },
          update: {
            $set: {
              organizationId,
              name,
              code,
              category,
              status: 'active',
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    const stages: Array<[string, string, number, boolean, boolean, boolean]> = [
      ['New', 'NEW', 10, true, false, false],
      ['Contacted', 'CONTACTED', 20, false, false, false],
      ['Application', 'APPLICATION', 30, false, false, false],
      ['Enrolled', 'ENROLLED', 40, false, true, false],
      ['Lost', 'LOST', 50, false, false, true],
    ];

    await this.leadStageModel.bulkWrite(
      stages.map(([name, code, order, isInitial, isConverted, isLost]) => ({
        updateOne: {
          filter: { organizationId, code },
          update: {
            $set: {
              organizationId,
              name,
              code,
              order,
              isInitial,
              isConverted,
              isLost,
              status: 'active',
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  private async seedCrmModuleRecords(
    organizationId: Types.ObjectId,
    now: Date,
    branchName: string,
  ) {
    const moduleKeys = EDUCATION_PLATFORM_MODULE_KEYS;

    await this.moduleRecordModel.bulkWrite(
      moduleKeys.map((moduleKey, index) => {
        const title = this.humanizeModuleKey(moduleKey);
        return {
          updateOne: {
            filter: {
              organizationId,
              moduleKey,
              title: `${title} Demo Record`,
            },
            update: {
              $set: {
                organizationId,
                moduleKey,
                title: `${title} Demo Record`,
                description: `Seeded Mentora CRM demo record for ${title}.`,
                status: index % 3 === 0 ? 'in_progress' : 'open',
                priority: index % 4 === 0 ? 'high' : 'medium',
                dueAt: new Date(now.getTime() + (index + 1) * 86_400_000),
                tags: ['seeded', 'mentora-demo', moduleKey],
                payload: {
                  owner:
                    index % 2 === 0 ? 'Admissions Team' : 'Operations Team',
                  branch: branchName,
                  source: 'master-seeder',
                  status: index % 3 === 0 ? 'In progress' : 'Open',
                  metric: `${index + 3}`,
                  student: index % 2 === 0 ? 'Aarav Sharma' : 'Meera Iyer',
                  course: index % 2 === 0 ? 'JEE Foundation' : 'NEET Target',
                },
                updatedAt: now,
              },
              $setOnInsert: { createdAt: now },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false },
    );

    return moduleKeys.length;
  }

  private humanizeModuleKey(moduleKey: string) {
    return moduleKey
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  // =========================================================
  // INDIAN DUMMY PROFILES
  // =========================================================

  private async seedIndianDummyProfiles() {
    const profiles = [
      ...this.buildIndianDummyProfiles(),
      this.buildPlayReviewerProfile(),
      this.buildPlayPhoneReviewerProfile(),
    ];
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const reviewerPasswordHash = await bcrypt.hash(PLAY_REVIEWER_PASSWORD, 10);
    const now = new Date();

    await this.userModel.updateMany(
      {
        'phone.phone': PLAY_PHONE_REVIEWER_PHONE,
        email: { $ne: PLAY_PHONE_REVIEWER_EMAIL },
      },
      {
        $unset: { phone: '' },
        $set: { isPhoneVerified: false },
        $pull: {
          authAccounts: {
            provider: AuthProvider.PHONE,
            providerId: `${PLAY_PHONE_REVIEWER_COUNTRY_CODE}|${PLAY_PHONE_REVIEWER_PHONE}`,
          },
        },
      },
    );

    const existingPhoneOwners = await this.userModel
      .find({
        'phone.phone': { $in: profiles.map((profile) => profile.phone) },
      })
      .select('email phone.phone')
      .lean();

    const phoneOwnerByNumber = new Map(
      existingPhoneOwners.map((user) => [user.phone?.phone, user.email]),
    );

    await this.userModel.bulkWrite(
      profiles.map((profile) => {
        const isPhoneReviewer = profile.email === PLAY_PHONE_REVIEWER_EMAIL;
        const isPlatinumReviewer = this.isPlayReviewerEmail(profile.email);
        const phoneOwner = phoneOwnerByNumber.get(profile.phone);
        const canUsePhone = !phoneOwner || phoneOwner === profile.email;

        return {
          updateOne: {
            filter: { email: profile.email },
            update: {
              $set: {
                email: profile.email,
                ...(canUsePhone
                  ? { phone: { countryCode: '91', phone: profile.phone } }
                  : {}),
                status: Status.ACTIVE,
                isEmailVerified: !isPhoneReviewer,
                isPhoneVerified: canUsePhone,
                isOnboardingCompleted: true,
                roles: [AppRole.USER],
                permissions: [],
                authAccounts: isPhoneReviewer
                  ? [
                      {
                        provider: AuthProvider.PHONE,
                        providerId: `${PLAY_PHONE_REVIEWER_COUNTRY_CODE}|${PLAY_PHONE_REVIEWER_PHONE}`,
                        isVerified: true,
                        isPrimary: true,
                        lastUsedAt: now,
                      },
                    ]
                  : [
                      {
                        provider: AuthProvider.EMAIL,
                        providerId: profile.email,
                        passwordHash:
                          profile.email === PLAY_REVIEWER_EMAIL
                            ? reviewerPasswordHash
                            : passwordHash,
                        isVerified: true,
                        isPrimary: true,
                        lastUsedAt: now,
                      },
                    ],
                lastLoginAt: now,
                updatedAt: now,
                ...(isPlatinumReviewer
                  ? {
                      membership: {
                        tier: PlanTier.PLATINUM,
                        status: SubscriptionStatus.ACTIVE,
                        startDate: now,
                        autoRenew: false,
                      },
                    }
                  : {}),
              },
              $setOnInsert: {
                ...(!isPlatinumReviewer
                  ? {
                      membership: {
                        tier: PlanTier.FREE,
                        status: SubscriptionStatus.ACTIVE,
                        startDate: now,
                        autoRenew: false,
                      },
                    }
                  : {}),
                createdAt: now,
              },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false },
    );

    const users = await this.userModel
      .find({ email: { $in: profiles.map((profile) => profile.email) } })
      .select('_id email')
      .lean();
    const userByEmail = new Map(users.map((user) => [user.email, user._id]));

    const profileWrites = [];
    const mediaWrites = [];
    const accountSettingsWrites = [];
    const privacySettingsWrites = [];
    const notificationSettingsWrites = [];
    const communicationSettingsWrites = [];
    const securitySettingsWrites = [];
    const localizationSettingsWrites = [];
    const accessibilitySettingsWrites = [];
    const mediaSettingsWrites = [];
    const aiSettingsWrites = [];
    const verificationWrites = [];

    for (const profile of profiles) {
      const userId = userByEmail.get(profile.email);
      if (!userId) continue;

      const imageFilename = `seed-profile-${profile.gender}-${profile.index}.jpg`;
      const imageUrl = this.getSeedProfileImageUrl(
        profile.gender,
        profile.index,
      );
      profileWrites.push({
        updateOne: {
          filter: { userId },
          update: {
            $set: {
              userId,
              personal: profile.personal,
              physical: profile.physical,
              education: profile.education,
              family: profile.family,
              age: profile.age,
              location: profile.location,
              profileScore: 82 + (profile.index % 16),
              profileCompletionPercentage: 82 + (profile.index % 16),
              visibilityScore: Math.min(
                100,
                78 +
                  (profile.index % 16) +
                  (profile.index % 3 === 0 ? 6 : 0) +
                  (profile.index % 10 === 0 ? 5 : 0),
              ),
              searchTags: profile.searchTags,
              aiTags: profile.aiTags,
              isPremium: profile.index % 10 === 0,
              status: ProfileStatus.ACTIVE,
              lastActiveAt: new Date(now.getTime() - profile.index * 3600000),
              updatedBy: userId,
              updatedAt: now,
            },
            $setOnInsert: { createdBy: userId, createdAt: now },
          },
          upsert: true,
        },
      });

      mediaWrites.push({
        updateOne: {
          filter: { userId, type: MediaType.IMAGE, filename: imageFilename },
          update: {
            $set: {
              userId,
              type: MediaType.IMAGE,
              filename: imageFilename,
              url: imageUrl,
              thumbnailUrl: imageUrl,
              mimeType: MimeType.IMAGE_JPEG,
              isPrimary: true,
              status: MediaStatus.ACTIVE,
              isActive: true,
              uploadedAt: now,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      });

      accountSettingsWrites.push(this.buildSettingsUpsert(userId));
      privacySettingsWrites.push(this.buildSettingsUpsert(userId));
      notificationSettingsWrites.push(this.buildSettingsUpsert(userId));
      communicationSettingsWrites.push(this.buildSettingsUpsert(userId));
      securitySettingsWrites.push(
        this.buildSettingsUpsert(userId, {
          lastPasswordChangedAt: now,
          lastLoginAt: now,
          lastLoginIp: '127.0.0.1',
        }),
      );
      localizationSettingsWrites.push(this.buildSettingsUpsert(userId));
      accessibilitySettingsWrites.push(this.buildSettingsUpsert(userId));
      mediaSettingsWrites.push(this.buildSettingsUpsert(userId));
      aiSettingsWrites.push(this.buildSettingsUpsert(userId));
      verificationWrites.push(
        this.buildSettingsUpsert(userId, {
          status:
            profile.index % 3 === 0
              ? VerificationStatus.APPROVED
              : VerificationStatus.NOT_STARTED,
          provider: VerificationProvider.MANUAL,
          ...(profile.index % 3 === 0 ? { verifiedAt: now } : {}),
        }),
      );
    }

    await Promise.all([
      this.profileModel.bulkWrite(profileWrites, { ordered: false }),
      this.mediaModel.bulkWrite(mediaWrites, { ordered: false }),
      this.accountSettingsModel.bulkWrite(accountSettingsWrites, {
        ordered: false,
      }),
      this.privacySettingsModel.bulkWrite(privacySettingsWrites, {
        ordered: false,
      }),
      this.notificationSettingsModel.bulkWrite(notificationSettingsWrites, {
        ordered: false,
      }),
      this.communicationSettingsModel.bulkWrite(communicationSettingsWrites, {
        ordered: false,
      }),
      this.securitySettingsModel.bulkWrite(securitySettingsWrites, {
        ordered: false,
      }),
      this.localizationSettingsModel.bulkWrite(localizationSettingsWrites, {
        ordered: false,
      }),
      this.accessibilitySettingsModel.bulkWrite(accessibilitySettingsWrites, {
        ordered: false,
      }),
      this.mediaSettingsModel.bulkWrite(mediaSettingsWrites, {
        ordered: false,
      }),
      this.aiSettingsModel.bulkWrite(aiSettingsWrites, { ordered: false }),
      this.verificationModel.bulkWrite(verificationWrites, { ordered: false }),
    ]);

    this.logger.log(' Indian dummy profiles seeded successfully', {
      female: profiles.filter((profile) => profile.gender === Gender.FEMALE)
        .length,
      male: profiles.filter((profile) => profile.gender === Gender.MALE).length,
      total: profiles.length,
    });
  }

  private buildIndianDummyProfiles() {
    const students = [
      ['Aarav', 'Mehta', Gender.MALE, 'Delhi', 'Delhi', 28.6139, 77.209, 14],
      [
        'Ananya',
        'Sharma',
        Gender.FEMALE,
        'Mumbai',
        'Maharashtra',
        19.076,
        72.8777,
        16,
      ],
      [
        'Kabir',
        'Verma',
        Gender.MALE,
        'Bengaluru',
        'Karnataka',
        12.9716,
        77.5946,
        18,
      ],
    ] as const;

    return students.map(
      ([firstName, lastName, gender, city, state, lat, lng, age], index) => {
        const birthYear = new Date().getFullYear() - age;
        const email = `${firstName}.${lastName}@yopmail.com`.toLowerCase();
        const phone = String(9876543211 + index);

        return {
          index,
          email,
          phone,
          gender,
          age,
          location: {
            type: 'Point' as const,
            coordinates: [lng, lat] as [number, number],
          },
          personal: {
            firstName,
            lastName,
            gender,
            dateOfBirth: `${birthYear}-${String((index % 12) + 1).padStart(
              2,
              '0',
            )}-${String((index % 27) + 1).padStart(2, '0')}`,
            religion: Religion.HINDU,
            religiousDetails: {},
            country: Country.INDIA,
            state,
            city,
            citizenship: 'Indian',
            motherTongue: ['Hindi', 'Marathi', 'Kannada'][index % 3],
            hobbies: ['Mathematics', 'Science', 'Reading', 'Coding'].slice(
              0,
              2 + (index % 3),
            ),
            languages: ['Hindi', 'English'],
            aboutMe: `${firstName} is preparing for structured AI tutoring with Mentora and wants guided practice, clear explanations, and progress tracking.`,
          },
          physical: {
            accessibilityNeeds: [],
          },
          education: {
            qualification: [
              Qualification.TENTH,
              Qualification.TWELFTH,
              Qualification.BTECH,
            ][index % 3],
            field: ['Grade 9', 'Grade 11', 'College Year 1'][index % 3],
            university: [
              'Delhi Public School',
              'Mumbai Junior College',
              'Bengaluru Institute of Technology',
            ][index % 3],
            occupation: [
              'Exam preparation',
              'STEM foundation',
              'AI mentorship',
            ][index % 3],
          },
          family: {
            fatherName: `Parent ${lastName}`,
            motherName: `Guardian ${lastName}`,
          },
          searchTags: [
            gender,
            Religion.HINDU,
            city,
            state,
            'ai_tutor',
            'student',
          ],
          aiTags: ['seeded', 'student', 'ai_tutor'],
        };
      },
    );
  }
  private buildPlayReviewerProfile() {
    const base = this.buildIndianDummyProfiles()[0];

    return {
      ...base,
      index: 1020,
      email: PLAY_REVIEWER_EMAIL,
      phone: '9899999001',
      personal: {
        ...base.personal,
        firstName: 'Play',
        lastName: 'Reviewer',
        aboutMe:
          'A complete reviewer profile for validating Mentora learning, communication, safety, and membership features.',
      },
      aiTags: [...base.aiTags, 'play-reviewer'],
    };
  }

  private buildPlayPhoneReviewerProfile() {
    const base =
      this.buildIndianDummyProfiles().find(
        (profile) => profile.gender === Gender.MALE,
      ) ?? this.buildIndianDummyProfiles()[1];

    return {
      ...base,
      index: 1050,
      email: PLAY_PHONE_REVIEWER_EMAIL,
      phone: PLAY_PHONE_REVIEWER_PHONE,
      personal: {
        ...base.personal,
        firstName: 'Phone',
        lastName: 'Reviewer',
        aboutMe:
          'A complete phone reviewer profile for validating Mentora authentication, learning, safety, and Platinum membership features.',
      },
      aiTags: [...base.aiTags, 'play-phone-reviewer'],
    };
  }

  private isPlayReviewerEmail(email?: string): boolean {
    return email === PLAY_REVIEWER_EMAIL || email === PLAY_PHONE_REVIEWER_EMAIL;
  }

  private async seedUserSubscriptions(): Promise<void> {
    const [freePlan, reviewerPlan] = await Promise.all([
      this.planModel
        .findOne({ slug: 'free', tier: PlanTier.FREE, isActive: true })
        .lean(),
      this.planModel
        .findOne({
          slug: 'platinum-yearly',
          tier: PlanTier.PLATINUM,
          isActive: true,
        })
        .lean(),
    ]);

    if (!freePlan || !reviewerPlan) {
      this.logger.warn(
        'Free or Platinum Yearly plan missing; seeded subscriptions were skipped',
      );
      return;
    }

    const seededEmails = [
      ...Object.values(AppRole).map((role) => `${role}@mentora.test`),
      ...this.buildIndianDummyProfiles().map((profile) => profile.email),
      PLAY_REVIEWER_EMAIL,
      PLAY_PHONE_REVIEWER_EMAIL,
    ];
    const users = await this.userModel
      .find({ email: { $in: seededEmails } })
      .select('_id email membership.tier')
      .lean();
    const eligibleUsers = users.filter((user) => {
      const expectedTier = this.isPlayReviewerEmail(user.email)
        ? PlanTier.PLATINUM
        : PlanTier.FREE;
      return !user.membership?.tier || user.membership.tier === expectedTier;
    });

    if (eligibleUsers.length === 0) {
      return;
    }

    const startDate = new Date();
    const activeStatuses = [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.TRIAL,
      SubscriptionStatus.GRACE_PERIOD,
    ];
    const reviewers = eligibleUsers.filter((user) =>
      this.isPlayReviewerEmail(user.email),
    );

    if (reviewers.length > 0) {
      await this.subscriptionModel.updateMany(
        {
          userId: { $in: reviewers.map((reviewer) => reviewer._id) },
          planId: { $ne: reviewerPlan._id },
          status: { $in: activeStatuses },
        },
        {
          $set: {
            status: SubscriptionStatus.EXPIRED,
            cancelledAt: startDate,
            cancelledReason: 'reviewer_plan_sync',
          },
        },
      );
    }

    await this.subscriptionModel.bulkWrite(
      eligibleUsers.map((user) => {
        const plan = this.isPlayReviewerEmail(user.email)
          ? reviewerPlan
          : freePlan;
        const endDate = new Date(
          startDate.getTime() + plan.durationDays * 86_400_000,
        );

        return {
          updateOne: {
            filter: {
              userId: user._id,
              planId: plan._id,
              status: { $in: activeStatuses },
              endDate: { $gt: startDate },
            },
            update: {
              $setOnInsert: {
                userId: user._id,
                planId: plan._id,
                startDate,
                endDate,
                autoRenew: false,
                status: SubscriptionStatus.ACTIVE,
                createdAt: startDate,
              },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false },
    );

    await this.userModel.bulkWrite(
      eligibleUsers.map((user) => {
        const plan = this.isPlayReviewerEmail(user.email)
          ? reviewerPlan
          : freePlan;
        const endDate = new Date(
          startDate.getTime() + plan.durationDays * 86_400_000,
        );

        return {
          updateOne: {
            filter: { _id: user._id, 'membership.tier': plan.tier },
            update: {
              $set: {
                'membership.status': SubscriptionStatus.ACTIVE,
                'membership.planId': String(plan._id),
                'membership.startDate': startDate,
                'membership.expiresAt': endDate,
                'membership.autoRenew': false,
              },
            },
          },
        };
      }),
      { ordered: false },
    );

    this.logger.log('Seeded user subscriptions synchronized', {
      total: eligibleUsers.length,
      reviewerPlan: reviewerPlan.slug,
    });
  }

  private buildSettingsUpsert(userId: Types.ObjectId, data = {}) {
    const now = new Date();

    return {
      updateOne: {
        filter: { userId },
        update: {
          $set: {
            userId,
            ...data,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    };
  }

  private getSeedProfileImageUrl(gender: Gender, index: number) {
    const folder = gender === Gender.FEMALE ? 'women' : 'men';
    const portraitId = index % 100;

    return `https://randomuser.me/api/portraits/${folder}/${portraitId}.jpg`;
  }

  // =========================================================
  // PERMISSIONS
  // =========================================================

  private async seedPermissions() {
    const permissions = Object.values(AppPermission);

    const result = await this.permissionModel.bulkWrite(
      permissions.map((permission) => ({
        updateOne: {
          filter: { name: permission },

          update: {
            $set: {
              name: permission,
              module: this.extractModule(permission),
              description: this.generateDescription(permission),
              isActive: true,
              updatedAt: new Date(),
            },

            $setOnInsert: {
              createdAt: new Date(),
            },
          },

          upsert: true,
        },
      })),
      {
        ordered: false,
      },
    );

    this.logger.log(` Permissions seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: permissions.length,
    });
  }

  // =========================================================
  // ROLES
  // =========================================================

  private async seedRoles() {
    const allPermissions = await this.permissionModel
      .find()
      .select('_id name')
      .lean();

    const permissionIdByName = new Map(
      allPermissions.map((permission) => [permission.name, permission._id]),
    );
    const roles = ROLE_PERMISSION_POLICIES.map((policy) => ({
      name: policy.name,
      description: policy.description,
      permissions: resolveRolePermissions(policy).map((permission) => {
        const permissionId = permissionIdByName.get(permission);
        if (!permissionId) {
          throw new Error(
            `Permission seed missing for role policy: ${permission}`,
          );
        }
        return permissionId;
      }),
    }));

    const result = await this.roleModel.bulkWrite(
      roles.map((role) => ({
        updateOne: {
          filter: {
            name: role.name,
          },

          update: {
            $set: {
              ...role,
              updatedAt: new Date(),
            },

            $setOnInsert: {
              createdAt: new Date(),
            },
          },

          upsert: true,
        },
      })),
      {
        ordered: false,
      },
    );

    this.logger.log(` Roles seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: roles.length,
    });
  }

  private async seedRoleTestUsers() {
    const now = new Date();
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const roles = Object.values(AppRole);

    const permissionPolicyByRole = new Map(
      ROLE_PERMISSION_POLICIES.map((policy) => [policy.name, policy]),
    );

    const result = await this.userModel.bulkWrite(
      roles.map((role) => {
        const email = `${role}@mentora.test`;
        const isLearningUser = [AppRole.STUDENT, AppRole.PARENT].includes(role);

        return {
          updateOne: {
            filter: { email },
            update: {
              $set: {
                email,
                status: Status.ACTIVE,
                isEmailVerified: true,
                isPhoneVerified: false,
                isOnboardingCompleted: isLearningUser,
                roles: [role],
                permissions: resolveRolePermissions(
                  permissionPolicyByRole.get(role) ?? {
                    name: role,
                    description: role,
                    permissionPrefixes: [],
                  },
                ),
                authAccounts: [
                  {
                    provider: AuthProvider.EMAIL,
                    providerId: email,
                    passwordHash,
                    isVerified: true,
                    isPrimary: true,
                    lastUsedAt: now,
                  },
                ],
                lastPasswordChangedAt: now,
                lastLoginAt: now,
                updatedAt: now,
                updatedBy: 'master-seeder',
              },
              $setOnInsert: {
                membership: {
                  tier: PlanTier.FREE,
                  status: SubscriptionStatus.ACTIVE,
                  startDate: now,
                  autoRenew: false,
                },
                referralPoints: 0,
                failedLoginAttempts: 0,
                createdAt: now,
                createdBy: 'master-seeder',
              },
            },
            upsert: true,
          },
        };
      }),
      {
        ordered: false,
      },
    );

    this.logger.log(` Role test users seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: roles.length,
      emails: roles.map((role) => `${role}@mentora.test`),
      password: SEED_PASSWORD,
    });
  }

  // =========================================================
  // FEATURES
  // =========================================================

  private async seedFeatures() {
    const features = FEATURE_SEEDS;

    const result = await this.featureModel.bulkWrite(
      features.map((feature) => ({
        updateOne: {
          filter: {
            key: feature.key,
          },

          update: {
            $set: {
              ...feature,
              isActive: true,
              updatedAt: new Date(),
            },

            $setOnInsert: {
              createdAt: new Date(),
            },
          },

          upsert: true,
        },
      })),
      {
        ordered: false,
      },
    );

    this.logger.log(` Features seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: features.length,
    });
  }

  // =========================================================
  // PLANS
  // =========================================================

  private async seedPlans() {
    const plans = PLAN_SEEDS;

    const result = await this.planModel.bulkWrite(
      plans.map((plan) => ({
        updateOne: {
          filter: {
            slug: plan.slug,
          },

          update: {
            $set: {
              ...plan,
              isActive: true,
              updatedAt: new Date(),
            },

            $setOnInsert: {
              createdAt: new Date(),
            },
          },

          upsert: true,
        },
      })),
      {
        ordered: false,
      },
    );

    this.logger.log(` Plans seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: plans.length,
    });
  }

  // =========================================================
  // PLAN FEATURE MAPPING
  // =========================================================

  private async seedPlanFeatures() {
    const plans = await this.planModel.find().lean();
    const features = await this.featureModel.find().lean();

    const planMap = new Map(
      plans.map((plan) => [plan.name.toUpperCase(), plan]),
    );

    const featureMap = new Map(
      features.map((feature) => [feature.key, feature]),
    );

    // ==========================================
    // TYPES
    // ==========================================

    type PlanSlug =
      | 'FREE'
      | 'SILVER_MONTHLY'
      | 'SILVER_QUARTERLY'
      | 'SILVER_YEARLY'
      | 'GOLD_MONTHLY'
      | 'GOLD_QUARTERLY'
      | 'GOLD_YEARLY'
      | 'PLATINUM_MONTHLY'
      | 'PLATINUM_QUARTERLY'
      | 'PLATINUM_YEARLY'
      | 'ASSISTED_HALF_YEARLY'
      | 'ASSISTED_YEARLY'
      | 'ASSISTED_CUSTOM'
      | 'LEARNING_BOOST_24H';

    type FeatureValue = number | boolean | string;

    interface PlanFeatureSeed {
      planSlug: PlanSlug;
      featureKey: FeatureKey;
      value: FeatureValue;
    }

    const mappings: PlanFeatureSeed[] = [];
    const mappingIndexByKey = new Map<string, number>();

    // ==========================================
    // HELPER
    // ==========================================

    const addFeature = (
      planSlug: PlanSlug,
      featureKey: FeatureKey,
      value: FeatureValue,
    ) => {
      const mappingKey = `${planSlug}:${featureKey}`;
      const nextMapping = {
        planSlug,
        featureKey,
        value,
      };
      const existingIndex = mappingIndexByKey.get(mappingKey);

      if (existingIndex !== undefined) {
        mappings[existingIndex] = nextMapping;
        return;
      }

      mappingIndexByKey.set(mappingKey, mappings.length);
      mappings.push(nextMapping);
    };

    const recurringPlanSlugs: PlanSlug[] = [
      'FREE',
      'SILVER_MONTHLY',
      'SILVER_QUARTERLY',
      'SILVER_YEARLY',
      'GOLD_MONTHLY',
      'GOLD_QUARTERLY',
      'GOLD_YEARLY',
      'PLATINUM_MONTHLY',
      'PLATINUM_QUARTERLY',
      'PLATINUM_YEARLY',
      'ASSISTED_HALF_YEARLY',
      'ASSISTED_YEARLY',
    ];

    recurringPlanSlugs.forEach((planSlug) => {
      FEATURE_SEEDS.forEach((seed) => {
        addFeature(planSlug, seed.key, seed.defaultValue as FeatureValue);
      });
    });

    CUSTOM_ASSISTED_FEATURE_MAPPINGS.forEach(({ featureKey, value }) =>
      addFeature('ASSISTED_CUSTOM', featureKey, value),
    );

    Object.entries(FIXED_PLAN_LIMITS).forEach(([planSlug, limits]) => {
      Object.entries(limits).forEach(([featureKey, value]) => {
        addFeature(planSlug as PlanSlug, featureKey as FeatureKey, value);
      });
    });

    // ==========================================
    // BULK OPERATIONS
    // ==========================================

    const operations = [];

    for (const mapping of mappings) {
      const plan = planMap.get(mapping.planSlug);

      const feature = featureMap.get(mapping.featureKey);

      if (!plan) {
        this.logger.warn(`Plan not found: ${mapping.planSlug}`);
        continue;
      }

      if (!feature) {
        this.logger.warn(`Feature not found: ${mapping.featureKey}`);
        continue;
      }

      const persistedValue =
        mapping.planSlug !== 'ASSISTED_CUSTOM' && feature.type === 'boolean'
          ? Boolean(mapping.value)
          : mapping.value;

      operations.push({
        updateOne: {
          filter: {
            planId: plan._id,
            featureId: feature._id,
          },

          update: {
            $set: {
              planId: new Types.ObjectId(plan._id),
              featureId: new Types.ObjectId(feature._id),
              value: persistedValue,
              updatedAt: new Date(),
            },

            $setOnInsert: {
              createdAt: new Date(),
            },
          },

          upsert: true,
        },
      });
    }

    const result = await this.planFeatureModel.bulkWrite(operations, {
      ordered: false,
    });

    this.logger.log(` Plan features mappings seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: mappings.length,
    });
  }

  // =========================================================
  // DEFAULT TEMPLATES
  // =========================================================

  private async seedDefaultTemplates() {
    const defaults = NOTIFICATION_TEMPLATE_SEEDS;

    // =====================================================
    // VALIDATE TEMPLATES
    // =====================================================

    for (const template of defaults) {
      this.validateTemplateVariables(template);
    }

    // ============================================
    // PREPARE BULK OPERATIONS
    // ============================================

    const operations = defaults.map((template) => ({
      updateOne: {
        filter: {
          key: template.key,
          locale: template.locale ?? 'en',
        },

        update: {
          $set: {
            ...template,
            locale: template.locale ?? 'en',
            updatedAt: new Date(),
          },

          $setOnInsert: {
            createdAt: new Date(),
          },
        },

        upsert: true,
      },
    }));

    // ============================================
    // EXECUTE BULK WRITE
    // ============================================

    if (operations.length === 0) {
      this.logger.log('Skipping notification template seeding');
      return;
    }

    const result = await this.notificationTemplateModel.bulkWrite(operations, {
      ordered: false,
    });

    this.logger.log(` Notification templates seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: defaults.length,
    });
  }

  // =========================================================
  // HELPERS
  // =========================================================

  private extractModule(permission: string): string {
    return permission.split(':')[0];
  }

  private generateDescription(permission: string): string {
    return permission.replace(/[:_]/g, ' ');
  }

  private validateTemplateVariables(
    template: Partial<NotificationTemplate>,
  ): void {
    const contents = [
      template.title,
      template.message,
      template.pushTitle,
      template.pushBody,
      template.emailSubject,
      template.emailBody,
      template.smsBody,
    ]
      .filter(Boolean)
      .join(' ');

    const regex = /{{(.*?)}}/g;

    const foundVariables = [
      ...new Set([...contents.matchAll(regex)].map((match) => match[1].trim())),
    ];

    const invalidVariables = foundVariables.filter(
      (variable) => !template.variables?.includes(variable),
    );

    if (invalidVariables.length > 0) {
      throw new Error(
        `Invalid variables in template "${template.key}": ${invalidVariables.join(', ')}`,
      );
    }
  }
}
