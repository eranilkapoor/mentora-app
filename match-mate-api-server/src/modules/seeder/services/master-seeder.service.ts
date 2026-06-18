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
  BloodGroup,
  BodyType,
  ChildPreference,
  Country,
  Drinking,
  Eating,
  FamilyStatus,
  FamilyType,
  FamilyValue,
  FeatureKey,
  Gender,
  ManglikStatus,
  MaritalStatus,
  MediaType,
  MimeType,
  OccupationType,
  PlanTier,
  ProfileFor,
  ProfileStatus,
  Religion,
  SiblingType,
  Smoking,
  Status,
  SubscriptionStatus,
  ResidencyPreference,
} from '@/common/enums';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  Profile,
  ProfileDocument,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  Preference,
  PreferenceDocument,
} from '@/modules/profiles/schemas/preference/preference.schema';
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
  NotificationTemplate,
  NotificationTemplateDocument,
} from '@/modules/notifications/schemas/notification-templates.schema';
import {
  FEATURE_SEEDS,
  INDIAN_DUMMY_PROFILE_SEED_DATA,
  NOTIFICATION_TEMPLATE_SEEDS,
  PLAN_SEEDS,
} from '../data';

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

    @InjectModel(NotificationTemplate.name)
    private readonly notificationTemplateModel: Model<NotificationTemplateDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    @InjectModel(Preference.name)
    private readonly preferenceModel: Model<PreferenceDocument>,

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
    await this.seedIndianDummyProfiles();

    this.logger.log('Master seeder completed');
  }

  // =========================================================
  // INDIAN DUMMY PROFILES
  // =========================================================

  private async seedIndianDummyProfiles() {
    const profiles = this.buildIndianDummyProfiles();
    const passwordHash = await bcrypt.hash('Test@125#', 10);
    const now = new Date();

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
                isEmailVerified: true,
                isPhoneVerified: canUsePhone,
                isOnboardingCompleted: true,
                roles: [AppRole.USER],
                permissions: [],
                authAccounts: [
                  {
                    provider: AuthProvider.EMAIL,
                    providerId: profile.email,
                    passwordHash,
                    isVerified: true,
                    isPrimary: true,
                    lastUsedAt: now,
                  },
                ],
                lastLoginAt: now,
                updatedAt: now,
              },
              $setOnInsert: {
                membership: {
                  tier: PlanTier.FREE,
                  status: SubscriptionStatus.ACTIVE,
                  startDate: now,
                  autoRenew: false,
                },
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
    const preferenceWrites = [];
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
      const phoneOwner = phoneOwnerByNumber.get(profile.phone);
      const canUsePhone = !phoneOwner || phoneOwner === profile.email;

      profileWrites.push({
        updateOne: {
          filter: { userId },
          update: {
            $set: {
              userId,
              profileFor: ProfileFor.SELF,
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
              isVerified: profile.index % 3 === 0,
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

      preferenceWrites.push({
        updateOne: {
          filter: { userId },
          update: {
            $set: {
              userId,
              filters: profile.preferenceFilters,
              settings: {
                isStrict: false,
                allowPartialMatches: true,
                horoscopeRequired: false,
                profileVerificationRequired: false,
                minimumMatchScore: 45,
              },
              weights: {
                age: 10,
                height: 10,
                religion: 15,
                caste: 5,
                location: 10,
                education: 10,
                occupation: 10,
                lifestyle: 10,
                horoscope: 5,
              },
              aboutPartner:
                'Looking for a kind, family-oriented Hindu partner with shared values.',
              schemaVersion: 1,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
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

      accountSettingsWrites.push(
        this.buildSettingsUpsert(userId, {
          emailVerified: true,
          phoneVerified: canUsePhone,
        }),
      );
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
          isVerified: profile.index % 3 === 0,
          isPhoneVerified: canUsePhone,
          isEmailVerified: true,
          isProfileVerified: profile.index % 3 === 0,
          ...(profile.index % 3 === 0 ? { verifiedAt: now } : {}),
        }),
      );
    }

    await Promise.all([
      this.profileModel.bulkWrite(profileWrites, { ordered: false }),
      this.preferenceModel.bulkWrite(preferenceWrites, { ordered: false }),
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
      password: 'Test@125#',
    });
  }

  private buildIndianDummyProfiles() {
    const {
      castes,
      cities,
      complexions,
      femaleNames,
      maleNames,
      occupations,
      qualifications,
      seeds,
    } = INDIAN_DUMMY_PROFILE_SEED_DATA;

    return seeds.map(({ gender, index }) => {
      const names = gender === Gender.FEMALE ? femaleNames : maleNames;
      const localIndex = index % names.length;
      const [firstName, baseLastName] = names[localIndex % names.length];
      const lastName = baseLastName;
      const [city, state, coordinates] = cities[index % cities.length];
      const caste = castes[index % castes.length];
      const age = 18 + (index % 23);
      const birthYear = new Date().getFullYear() - age;
      const [occupation, occupationType] =
        occupations[index % occupations.length];
      const qualification = qualifications[index % qualifications.length];
      const email = `${firstName}.${lastName}@yopmail.com`.toLowerCase();
      const phone = String(9876543210 + index);
      const height =
        gender === Gender.FEMALE ? 152 + (index % 20) : 165 + (index % 20);

      return {
        index,
        email,
        phone,
        gender,
        age,
        location: {
          type: 'Point' as const,
          coordinates: [coordinates[0], coordinates[1]] as [number, number],
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
          caste,
          manglikStatus:
            index % 7 === 0 ? ManglikStatus.MANGLIK : ManglikStatus.NON_MANGLIK,
          country: Country.INDIA,
          state,
          city,
          citizenship: 'Indian',
          willingToRelocate: index % 4 === 0,
          motherTongue: ['Hindi', 'Marathi', 'Gujarati', 'Punjabi'][index % 4],
          maritalStatus: MaritalStatus.NEVER_MARRIED,
          hasChildren: false,
          smoking: Smoking.NON_SMOKER,
          drinking: index % 5 === 0 ? Drinking.SOCIALLY : Drinking.NON_DRINKER,
          eating: index % 3 === 0 ? Eating.NON_VEGETARIAN : Eating.VEGETARIAN,
          hobbies: ['Travel', 'Music', 'Reading', 'Cooking'].slice(
            0,
            2 + (index % 3),
          ),
          languages: ['Hindi', 'English'],
          aboutMe: `${firstName} is a family-oriented, career-focused Hindu profile from ${city}.`,
        },
        physical: {
          height,
          weight:
            gender === Gender.FEMALE ? 48 + (index % 18) : 62 + (index % 22),
          bloodGroup:
            Object.values(BloodGroup)[index % Object.values(BloodGroup).length],
          bodyType:
            gender === Gender.FEMALE
              ? [
                  BodyType.SLIM,
                  BodyType.AVERAGE,
                  BodyType.FIT,
                  BodyType.PETITE,
                ][index % 4]
              : [
                  BodyType.AVERAGE,
                  BodyType.ATHLETIC,
                  BodyType.FIT,
                  BodyType.MUSCULAR,
                ][index % 4],
          complexion: complexions[index % complexions.length],
          disabilityStatus: false,
        },
        education: {
          qualification,
          field: ['Engineering', 'Commerce', 'Management', 'Science'][
            index % 4
          ],
          university: [
            'Delhi University',
            'Mumbai University',
            'Pune University',
            'Rajasthan University',
          ][index % 4],
          occupationType,
          occupation,
          companyName: [
            'TCS',
            'Infosys',
            'HDFC Bank',
            'Apollo',
            'Family Business',
          ][index % 5],
          jobRole: occupation,
          annualIncomeAmount: 500000 + (index % 12) * 150000,
        },
        family: {
          fatherName: `Mr. ${baseLastName}`,
          motherName: `Mrs. ${baseLastName}`,
          fatherOccupation: [
            'Business',
            'Government Service',
            'Retired',
            'Teacher',
          ][index % 4],
          motherOccupation: ['Homemaker', 'Teacher', 'Business', 'Retired'][
            index % 4
          ],
          familyType: index % 2 === 0 ? FamilyType.NUCLEAR : FamilyType.JOINT,
          familyStatus: [
            FamilyStatus.MIDDLE_CLASS,
            FamilyStatus.UPPER_MIDDLE_CLASS,
            FamilyStatus.RICH,
          ][index % 3],
          familyValues: [
            FamilyValue.TRADITIONAL,
            FamilyValue.MODERATE,
            FamilyValue.LIBERAL,
          ][index % 3],
          siblings: {
            brothersCount: index % 3,
            sistersCount: (index + 1) % 3,
            marriedBrothersCount: index % 2,
            marriedSistersCount: (index + 1) % 2,
            details: [
              {
                type: SiblingType.BROTHER,
                married: index % 2 === 0,
                occupation: 'Engineer',
              },
            ],
          },
        },
        preferenceFilters: {
          age: {
            min: gender === Gender.FEMALE ? 24 : 20,
            max: gender === Gender.FEMALE ? 40 : 36,
          },
          height: {
            min: gender === Gender.FEMALE ? 165 : 150,
            max: gender === Gender.FEMALE ? 190 : 175,
          },
          annualIncome: { min: 300000, max: 5000000 },
          maritalStatus: [MaritalStatus.NEVER_MARRIED],
          religion: [Religion.HINDU],
          caste: [...castes],
          childPreference: ChildPreference.DOES_NOT_MATTER,
          residencyPreference: ResidencyPreference.DOES_NOT_MATTER,
          country: [Country.INDIA],
          state: [state],
          city: [city],
          qualification: [...qualifications],
          occupationType: Object.values(OccupationType),
          bodyType: Object.values(BodyType),
          complexion: [...complexions],
          smoking: [Smoking.NON_SMOKER],
          drinking: [Drinking.NON_DRINKER, Drinking.SOCIALLY],
          eating: [Eating.VEGETARIAN, Eating.NON_VEGETARIAN],
          languages: ['Hindi', 'English'],
        },
        searchTags: [
          gender,
          Religion.HINDU,
          caste,
          city,
          state,
          qualification,
          occupation,
        ],
        aiTags: ['seeded', 'indian', 'hindu', caste],
      };
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

    const adminPermissionIds = allPermissions.map(
      (permission) => permission._id,
    );

    const moderatorPermissionIds = allPermissions
      .filter((permission) =>
        ['user:', 'profile:', 'media:', 'report:', 'block:', 'chat:'].some(
          (prefix) => permission.name.startsWith(prefix),
        ),
      )
      .map((permission) => permission._id);

    const permissionIdsByPrefix = (prefixes: string[]) =>
      allPermissions
        .filter((permission) =>
          prefixes.some((prefix) => permission.name.startsWith(prefix)),
        )
        .map((permission) => permission._id);

    const roles = [
      {
        name: AppRole.SUPER_ADMIN,
        description: 'Super Admin',
        permissions: adminPermissionIds,
      },
      {
        name: AppRole.ADMIN,
        description: 'Admin',
        permissions: adminPermissionIds,
      },
      {
        name: AppRole.SUPPORT,
        description: 'Support Operator',
        permissions: permissionIdsByPrefix([
          'user:',
          'report:',
          'block:',
          'activity:',
        ]),
      },
      {
        name: AppRole.FINANCE,
        description: 'Finance Operator',
        permissions: permissionIdsByPrefix([
          'payment:',
          'subscription:',
          'plan:',
          'analytics:',
          'dashboard:',
        ]),
      },
      {
        name: AppRole.KYC_REVIEWER,
        description: 'KYC Reviewer',
        permissions: permissionIdsByPrefix(['profile:', 'media:', 'activity:']),
      },
      {
        name: AppRole.CONTENT_MODERATOR,
        description: 'Content Moderator',
        permissions: permissionIdsByPrefix([
          'media:',
          'chat:',
          'report:',
          'block:',
        ]),
      },
      {
        name: AppRole.MARKETING_ADMIN,
        description: 'Marketing Admin',
        permissions: permissionIdsByPrefix([
          'notification:',
          'analytics:',
          'dashboard:',
        ]),
      },

      {
        name: AppRole.MODERATOR,
        description: 'Moderator',
        permissions: moderatorPermissionIds,
      },
      {
        name: AppRole.USER,
        description: 'Regular User',
        permissions: [],
      },
    ];

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

    const result = await this.userModel.bulkWrite(
      roles.map((role) => {
        const email = `${role}@webnza.com`;

        return {
          updateOne: {
            filter: { email },
            update: {
              $set: {
                email,
                status: Status.ACTIVE,
                isEmailVerified: true,
                isPhoneVerified: false,
                isOnboardingCompleted: role === AppRole.USER,
                roles: [role],
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
      emails: roles.map((role) => `${role}@webnza.com`),
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
      | 'GOLD_MONTHLY'
      | 'GOLD_QUARTERLY'
      | 'GOLD_YEARLY'
      | 'PLATINUM_MONTHLY'
      | 'PLATINUM_QUARTERLY'
      | 'PLATINUM_YEARLY'
      | 'ASSISTED_QUARTERLY'
      | 'ASSISTED_HALF_YEARLY'
      | 'ASSISTED_YEARLY'
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
      value: FeatureValue = 1,
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
      'GOLD_MONTHLY',
      'GOLD_QUARTERLY',
      'GOLD_YEARLY',
      'PLATINUM_MONTHLY',
      'PLATINUM_QUARTERLY',
      'PLATINUM_YEARLY',
      'ASSISTED_QUARTERLY',
      'ASSISTED_HALF_YEARLY',
      'ASSISTED_YEARLY',
    ];

    const platformFeatures: [FeatureKey, FeatureValue][] = [
      [FeatureKey.EMAIL_REGISTRATION, 1],
      [FeatureKey.PHONE_REGISTRATION, 1],
      [FeatureKey.SOCIAL_LOGIN_GOOGLE, 1],
      [FeatureKey.SOCIAL_LOGIN_APPLE, 1],
      [FeatureKey.SOCIAL_LOGIN_FACEBOOK, 1],
      [FeatureKey.EMAIL_VERIFICATION, 1],
      [FeatureKey.PHONE_VERIFICATION, 1],
      [FeatureKey.OTP_LOGIN, 1],
      [FeatureKey.TWO_FACTOR_AUTH, 1],
      [FeatureKey.DEVICE_MANAGEMENT, 1],
      [FeatureKey.MULTI_DEVICE_LOGIN, 1],
      [FeatureKey.SESSION_HISTORY, 1],
      [FeatureKey.CREATE_PROFILE, 1],
      [FeatureKey.EDIT_PROFILE, 1],
      [FeatureKey.DELETE_PROFILE, 1],
      [FeatureKey.BASIC_MATCHING, 1],
      [FeatureKey.BASIC_SEARCH, 1],
      [FeatureKey.BASIC_FILTERS, 1],
      [FeatureKey.SEARCH_BY_RELIGION, 1],
      [FeatureKey.SEARCH_BY_CASTE, 1],
      [FeatureKey.SEARCH_BY_LOCATION, 1],
      [FeatureKey.SEARCH_BY_EDUCATION, 1],
      [FeatureKey.SEARCH_BY_PROFESSION, 1],
      [FeatureKey.SEARCH_BY_HEIGHT, 1],
      [FeatureKey.LOCATION_BASED_SEARCH, 1],
      [FeatureKey.SMART_MATCHES, 1],
      [FeatureKey.COMPATIBILITY_SCORE, 1],
      [FeatureKey.RELIGION_PREFERENCES, 1],
      [FeatureKey.CASTE_PREFERENCES, 1],
      [FeatureKey.FAMILY_MANAGED_PROFILE, 1],
      [FeatureKey.FAMILY_DETAILS, 1],
      [FeatureKey.PUSH_NOTIFICATIONS, 1],
      [FeatureKey.EMAIL_NOTIFICATIONS, 1],
      [FeatureKey.PHOTO_APPROVAL, 1],
      [FeatureKey.VIDEO_APPROVAL, 1],
      [FeatureKey.PROFILE_VERIFICATION, 1],
      [FeatureKey.REPORT_USER, 1],
      [FeatureKey.BLOCK_USERS, 1],
      [FeatureKey.SPAM_DETECTION, 1],
      [FeatureKey.RESTRICTED_PROFILES, 1],
      [FeatureKey.CUSTOMER_SUPPORT_CHAT, 1],
      [FeatureKey.SUPPORT_TICKETS, 1],
      [FeatureKey.ACCOUNT_DELETION, 1],
      [FeatureKey.GDPR_COMPLIANCE, 1],
      [FeatureKey.DATA_EXPORT, 1],
      [FeatureKey.CONSENT_MANAGEMENT, 1],
      [FeatureKey.PRIVACY_CONTROLS, 1],
    ];

    recurringPlanSlugs.forEach((planSlug) => {
      platformFeatures.forEach(([feature, value]) =>
        addFeature(planSlug, feature, value),
      );
    });

    // ==========================================
    // FREE PLAN
    // ==========================================

    (
      [
        [FeatureKey.CREATE_PROFILE, 1],
        [FeatureKey.EDIT_PROFILE, 1],
        [FeatureKey.UPLOAD_PHOTOS, 5],
        [FeatureKey.MULTIPLE_PROFILE_PHOTOS, 5],
        [FeatureKey.SEND_INTEREST, 10],
        [FeatureKey.VIEW_INTERESTS, 1],
        [FeatureKey.ACCEPT_INTEREST, 1],
        [FeatureKey.REJECT_INTEREST, 1],
        [FeatureKey.SHORTLIST_PROFILES, 20],
        [FeatureKey.VIEW_PROFILE_PHOTOS, 1],
        [FeatureKey.PROFILE_VIEWS, 25],
        [FeatureKey.BASIC_SEARCH, 1],
        [FeatureKey.BASIC_FILTERS, 1],
        [FeatureKey.MATCH_LIMIT, 20],
        [FeatureKey.DAILY_PROFILE_VIEWS, 25],
        [FeatureKey.CHAT_ACCESS, 1],
        [FeatureKey.MESSAGE_LIMIT, 20],
        [FeatureKey.PROFILE_COMPLETION_SCORE, 1],
        [FeatureKey.PROFILE_VERIFICATION, 1],
        [FeatureKey.PUSH_NOTIFICATIONS, 1],
        [FeatureKey.REPORT_USER, 1],
        [FeatureKey.BLOCK_USERS, 1],
        [FeatureKey.CUSTOMER_SUPPORT_CHAT, 1],
      ] as [FeatureKey, FeatureValue][]
    ).forEach(([feature, value]) => addFeature('FREE', feature, value));

    // ==========================================
    // GOLD FEATURES
    // ==========================================

    const goldFeatures: [FeatureKey, FeatureValue][] = [
      [FeatureKey.CREATE_PROFILE, 1],
      [FeatureKey.EDIT_PROFILE, 1],
      [FeatureKey.ADVANCED_PROFILE_COMPLETION, 1],
      [FeatureKey.UPLOAD_PHOTOS, 20],
      [FeatureKey.MULTIPLE_PROFILE_PHOTOS, 20],
      [FeatureKey.UPLOAD_VIDEOS, 5],
      [FeatureKey.PRIVATE_PHOTOS, 1],
      [FeatureKey.HIDE_LAST_SEEN, 1],
      [FeatureKey.HIDE_ONLINE_STATUS, 1],
      [FeatureKey.HIDE_PROFILE_PHOTO, 1],
      [FeatureKey.PROFILE_HIGHLIGHT, 1],
      [FeatureKey.UNLIMITED_CHAT, -1],
      [FeatureKey.CHAT_WITH_MATCHES_ONLY, 1],
      [FeatureKey.SEND_INTEREST, -1],
      [FeatureKey.VIEW_INTERESTS, 1],
      [FeatureKey.ACCEPT_INTEREST, 1],
      [FeatureKey.REJECT_INTEREST, 1],
      [FeatureKey.VIEW_CONTACT, 1],
      [FeatureKey.REQUEST_CONTACT, 1],
      [FeatureKey.VIEW_PHONE_NUMBER, 1],
      [FeatureKey.VIEW_EMAIL_ADDRESS, 1],
      [FeatureKey.CHAT_ACCESS, 1],
      [FeatureKey.READ_RECEIPTS, 1],
      [FeatureKey.TYPING_INDICATOR, 1],
      [FeatureKey.SEND_IMAGES_IN_CHAT, 1],
      [FeatureKey.SEND_VOICE_NOTES, 1],
      [FeatureKey.VOICE_CALL, 1],
      [FeatureKey.VIEW_PROFILE_PHOTOS, 1],
      [FeatureKey.VIEW_PRIVATE_PHOTOS, 1],
      [FeatureKey.REQUEST_PHOTOS, 1],
      [FeatureKey.VIEW_PROFILE_VIDEOS, 1],
      [FeatureKey.ADVANCED_SEARCH, 1],
      [FeatureKey.ADVANCED_FILTERS, 1],
      [FeatureKey.SEARCH_BY_INCOME, 1],
      [FeatureKey.UNLIMITED_SEARCH, -1],
      [FeatureKey.UNLIMITED_PROFILE_VIEWS, -1],
      [FeatureKey.PROFILE_VIEWS, -1],
      [FeatureKey.WHO_VIEWED_ME, 1],
      [FeatureKey.PROFILE_ANALYTICS, 1],
      [FeatureKey.DAILY_ACTIVITY_STATS, 1],
      [FeatureKey.TOP_IN_SEARCH, 1],
      [FeatureKey.SHOW_ON_HOME, 1],
      [FeatureKey.SMART_MATCHES, 1],
      [FeatureKey.COMPATIBILITY_SCORE, 1],
      [FeatureKey.RELIGION_PREFERENCES, 1],
      [FeatureKey.CASTE_PREFERENCES, 1],
      [FeatureKey.MANGLIK_MATCHING, 1],
      [FeatureKey.FAMILY_DETAILS, 1],
      [FeatureKey.PUSH_NOTIFICATIONS, 1],
      [FeatureKey.EMAIL_NOTIFICATIONS, 1],
      [FeatureKey.MARKETING_NOTIFICATIONS, 1],
      [FeatureKey.AD_FREE_EXPERIENCE, 1],
      [FeatureKey.PROFILE_BOOST, 2],
      [FeatureKey.DAILY_BOOSTS, 1],
      [FeatureKey.PRIORITY_SUPPORT, 1],
      [FeatureKey.MONTHLY_SUBSCRIPTION, 30],
      [FeatureKey.QUARTERLY_SUBSCRIPTION, 90],
      [FeatureKey.YEARLY_SUBSCRIPTION, 365],
      [FeatureKey.AUTO_RENEWAL, 1],
      [FeatureKey.GRACE_PERIOD, 3],
      [FeatureKey.WALLET_SYSTEM, 1],
      [FeatureKey.REPORT_USER, 1],
      [FeatureKey.BLOCK_USERS, 1],
    ];

    (['GOLD_MONTHLY', 'GOLD_QUARTERLY', 'GOLD_YEARLY'] as PlanSlug[]).forEach(
      (planSlug) => {
        goldFeatures.forEach(([feature, value]) =>
          addFeature(planSlug, feature, value),
        );
      },
    );

    // ==========================================
    // PLATINUM FEATURES
    // ==========================================

    const platinumFeatures: [FeatureKey, FeatureValue][] = [
      ...goldFeatures,

      [FeatureKey.VIDEO_PROFILE, 1],
      [FeatureKey.AUDIO_INTRO, 1],
      [FeatureKey.FEATURED_PROFILE, 1],
      [FeatureKey.PRIVATE_ALBUM, 1],
      [FeatureKey.INCOGNITO_MODE, 1],
      [FeatureKey.ID_VERIFICATION, 1],
      [FeatureKey.VERIFIED_BADGE, 1],
      [FeatureKey.HOROSCOPE_UPLOAD, 1],
      [FeatureKey.KUNDLI_MATCHING, 1],
      [FeatureKey.ASTROLOGY_REPORT, 1],

      [FeatureKey.PRIORITY_INTEREST, 1],
      [FeatureKey.SHORTLIST_PROFILES, -1],
      [FeatureKey.FAVORITE_PROFILES, -1],

      [FeatureKey.CHAT_WITHOUT_MATCH, 1],
      [FeatureKey.PRIORITY_CHAT, 1],
      [FeatureKey.MESSAGE_TRANSLATION, 1],
      [FeatureKey.SEND_VIDEOS_IN_CHAT, 1],
      [FeatureKey.VIDEO_CALL, 1],

      [FeatureKey.DIRECT_CONTACT_ACCESS, 1],

      [FeatureKey.REQUEST_PRIVATE_VIDEOS, 1],
      [FeatureKey.AI_PHOTO_VERIFICATION, 1],
      [FeatureKey.BLURRED_PHOTO_MODE, 1],

      [FeatureKey.GLOBAL_SEARCH, 1],
      [FeatureKey.INTERNATIONAL_MATCHES, 1],
      [FeatureKey.NRI_MATCHING, 1],
      [FeatureKey.SAVED_SEARCHES, 1],
      [FeatureKey.RECENT_SEARCHES, 1],
      [FeatureKey.FEATURED_IN_SEARCH, 1],
      [FeatureKey.PRIORITY_SEARCH_RANKING, 1],

      [FeatureKey.ADVANCED_MATCHING, 1],
      [FeatureKey.AI_RECOMMENDATIONS, 1],
      [FeatureKey.AI_PROFILE_SUMMARY, 1],
      [FeatureKey.AI_PHOTO_SELECTION, 1],
      [FeatureKey.AI_COMPATIBILITY_ANALYSIS, 1],
      [FeatureKey.AI_CONVERSATION_STARTER, 1],
      [FeatureKey.AI_INTEREST_PREDICTION, 1],
      [FeatureKey.AI_FAKE_PROFILE_DETECTION, 1],
      [FeatureKey.PERSONALITY_MATCHING, 1],
      [FeatureKey.INTEREST_MATCHING, 1],
      [FeatureKey.LOCATION_MATCHING, 1],
      [FeatureKey.STRICT_PREFERENCES, 1],
      [FeatureKey.SMART_PREFERENCES, 1],

      [FeatureKey.SUBCASTE_PREFERENCES, 1],
      [FeatureKey.COMMUNITY_BASED_MATCHING, 1],
      [FeatureKey.MARRIAGE_TIMELINE_PREFERENCE, 1],
      [FeatureKey.CHILDREN_PREFERENCE, 1],
      [FeatureKey.EATING_PREFERENCES, 1],
      [FeatureKey.LIFESTYLE_PREFERENCES, 1],

      [FeatureKey.FAMILY_MANAGED_PROFILE, 1],
      [FeatureKey.FAMILY_CONTACT_VISIBILITY, 1],
      [FeatureKey.PARENT_LOGIN, 1],
      [FeatureKey.GUARDIAN_ACCESS, 1],
      [FeatureKey.FAMILY_PREFERENCES, 1],

      [FeatureKey.INTEREST_ANALYTICS, 1],
      [FeatureKey.CHAT_ANALYTICS, 1],
      [FeatureKey.ENGAGEMENT_SCORE, 1],
      [FeatureKey.MATCH_SUCCESS_RATE, 1],
      [FeatureKey.WEEKLY_REPORTS, 1],

      [FeatureKey.SMS_NOTIFICATIONS, 1],
      [FeatureKey.INSTANT_MATCH_ALERTS, 1],
      [FeatureKey.DAILY_MATCH_DIGEST, 1],

      [FeatureKey.LOCATION_BASED_MATCHING, 1],
      [FeatureKey.NEARBY_PROFILES, 1],
      [FeatureKey.TRAVEL_MODE, 1],

      [FeatureKey.VIP_BADGE, 1],
      [FeatureKey.PREMIUM_BADGE, 1],
      [FeatureKey.RELATIONSHIP_MANAGER, 1],
      [FeatureKey.DEDICATED_RELATIONSHIP_MANAGER, 1],
      [FeatureKey.CONCIERGE_MATCHMAKING, 1],
      [FeatureKey.PERSONAL_MATCHMAKER, 1],

      [FeatureKey.WEEKLY_BOOSTS, 7],
      [FeatureKey.MONTHLY_BOOSTS, 30],
      [FeatureKey.UNLIMITED_BOOSTS, -1],
      [FeatureKey.SPOTLIGHT_PROFILE, 1],

      [FeatureKey.PROMO_CODES, 1],
      [FeatureKey.REFERRAL_REWARDS, 1],
      [FeatureKey.REFERRAL_BONUS, 1],
      [FeatureKey.EARN_CREDITS, 1],

      [FeatureKey.SAFE_MODE, 1],
      [FeatureKey.FRAUD_DETECTION, 1],
      [FeatureKey.SPAM_DETECTION, 1],
      [FeatureKey.MANUAL_PROFILE_REVIEW, 1],

      [FeatureKey.SHORTLIST_LIMIT, -1],
      [FeatureKey.CONTACT_VIEW_LIMIT, -1],
      [FeatureKey.MESSAGE_LIMIT, -1],
      [FeatureKey.MATCH_LIMIT, -1],

      [FeatureKey.STREAK_REWARDS, 1],
      [FeatureKey.DAILY_LOGIN_REWARDS, 1],
      [FeatureKey.MATCH_QUIZ, 1],
      [FeatureKey.COMPATIBILITY_GAMES, 1],

      [FeatureKey.SUPPORT_TICKETS, 1],
      [FeatureKey.ACCOUNT_EXPORT, 1],
      [FeatureKey.DATA_EXPORT, 1],
      [FeatureKey.PRIVACY_CONTROLS, 1],
    ];

    (
      [
        'PLATINUM_MONTHLY',
        'PLATINUM_QUARTERLY',
        'PLATINUM_YEARLY',
        'ASSISTED_QUARTERLY',
        'ASSISTED_HALF_YEARLY',
        'ASSISTED_YEARLY',
      ] as PlanSlug[]
    ).forEach((planSlug) => {
      platinumFeatures.forEach(([feature, value]) =>
        addFeature(planSlug, feature, value),
      );
    });

    (
      [
        [FeatureKey.PROFILE_BOOST, 1],
        [FeatureKey.ONE_TIME_BOOST_PURCHASE, 1],
        [FeatureKey.SPOTLIGHT_PROFILE, 1],
      ] as [FeatureKey, FeatureValue][]
    ).forEach(([feature, value]) =>
      addFeature('PROFILE_BOOST_24H', feature, value),
    );

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
              value: mapping.value,
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

    if (!operations || operations.length <= 0) {
      this.logger.log('Skipping plan feature seeding');
      return;
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

    if (!operations || operations.length <= 0) {
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
