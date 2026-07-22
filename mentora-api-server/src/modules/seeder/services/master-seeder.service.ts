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
  Subject,
  SubjectDocument,
} from '@/modules/learning/schemas/learning.schemas';
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
    await this.seedUserSubscriptions();

    this.logger.log('Master seeder completed');
  }

  // =========================================================
  // MENTORA ACADEMIC CATALOG
  // =========================================================

  private async seedMentoraAcademicCatalog() {
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

    this.logger.log('Mentora academic catalog seeded successfully', {
      subjects: subjects.length,
      grades: 'class-6..class-10',
    });
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
    const passwordHash = await bcrypt.hash('Test@125#', 10);
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
          'A complete reviewer profile for validating Mentora discovery, communication, safety, and membership features.',
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
          'A complete phone reviewer profile for validating Mentora authentication, matching, safety, and Platinum membership features.',
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
    const passwordHash = await bcrypt.hash('Test@125#', 10);
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
      password: 'Test@125#',
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
      | 'PROFILE_BOOST_24H';

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
