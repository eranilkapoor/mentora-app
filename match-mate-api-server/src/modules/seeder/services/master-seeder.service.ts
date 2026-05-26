import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { AppLogger } from 'src/common/logger/logger.service';

import {
  Permission,
  PermissionDocument,
} from 'src/modules/admin/schemas/permission.schema';
import { Role, RoleDocument } from 'src/modules/admin/schemas/role.schema';
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
} from 'src/common/enums';
import { AuthProvider } from 'src/modules/auth/enums/auth-provider.enum';
import { User, UserDocument } from 'src/modules/auth/schemas/user.schema';
import {
  Profile,
  ProfileDocument,
} from 'src/modules/profile/schemas/profile/profile.schema';
import {
  Preference,
  PreferenceDocument,
} from 'src/modules/profile/schemas/preference/preference.schema';
import {
  Media,
  MediaDocument,
  MediaStatus,
} from 'src/modules/profile/schemas/media/media.schema';
import {
  AccountSettings,
  AccountSettingsDocument,
} from 'src/modules/settings/schemas/account-settings.schema';
import {
  PrivacySettings,
  PrivacySettingsDocument,
} from 'src/modules/settings/schemas/privacy-settings.schema';
import {
  NotificationSettings,
  NotificationSettingsDocument,
} from 'src/modules/settings/schemas/notification-settings.schema';
import {
  CommunicationSettings,
  CommunicationSettingsDocument,
} from 'src/modules/settings/schemas/communication-settings.schema';
import {
  SecuritySettings,
  SecuritySettingsDocument,
} from 'src/modules/settings/schemas/security-settings.schema';
import {
  LocalizationSettings,
  LocalizationSettingsDocument,
} from 'src/modules/settings/schemas/localization-settings.schema';
import {
  AccessibilitySettings,
  AccessibilitySettingsDocument,
} from 'src/modules/settings/schemas/accessibility-settings.schema';
import {
  MediaSettings,
  MediaSettingsDocument,
} from 'src/modules/settings/schemas/media-settings.schema';
import {
  AiSettings,
  AiSettingsDocument,
} from 'src/modules/settings/schemas/ai-settings.schema';
import {
  Verification,
  VerificationDocument,
} from 'src/modules/profile/schemas/settings/verification.schema';
import {
  Plan,
  PlanDocument,
} from 'src/modules/subscription/schemas/plan.schema';
import {
  Feature,
  FeatureDocument,
} from 'src/modules/subscription/schemas/feature.schema';
import {
  PlanFeature,
  PlanFeatureDocument,
} from 'src/modules/subscription/schemas/plan-feature.schema';
import {
  NotificationTemplates,
  NotificationTemplatesDocument,
} from 'src/modules/notification/schemas/notification-templates.schema';
import {
  FEATURE_SEEDS,
  INDIAN_DUMMY_PROFILE_SEED_DATA,
  NOTIFICATION_TEMPLATE_SEEDS,
  PLAN_SEEDS,
} from '../data';

@Injectable()
export class MasterSeederService implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
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

    @InjectModel(NotificationTemplates.name)
    private readonly notificationTemplateModel: Model<NotificationTemplatesDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    @InjectModel(Preference.name)
    private readonly preferenceModel: Model<PreferenceDocument>,

    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,

    @InjectModel(AccountSettings.name)
    private readonly accountSettingsModel: Model<AccountSettingsDocument>,

    @InjectModel(PrivacySettings.name)
    private readonly privacySettingsModel: Model<PrivacySettingsDocument>,

    @InjectModel(NotificationSettings.name)
    private readonly notificationSettingsModel: Model<NotificationSettingsDocument>,

    @InjectModel(CommunicationSettings.name)
    private readonly communicationSettingsModel: Model<CommunicationSettingsDocument>,

    @InjectModel(SecuritySettings.name)
    private readonly securitySettingsModel: Model<SecuritySettingsDocument>,

    @InjectModel(LocalizationSettings.name)
    private readonly localizationSettingsModel: Model<LocalizationSettingsDocument>,

    @InjectModel(AccessibilitySettings.name)
    private readonly accessibilitySettingsModel: Model<AccessibilitySettingsDocument>,

    @InjectModel(MediaSettings.name)
    private readonly mediaSettingsModel: Model<MediaSettingsDocument>,

    @InjectModel(AiSettings.name)
    private readonly aiSettingsModel: Model<AiSettingsDocument>,

    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
  ) {}

  async onApplicationBootstrap() {
    const shouldSeed = this.configService.get<boolean>('runSeeder');

    if (!shouldSeed) {
      this.logger.log('Skipping data seeding');

      return;
    }

    await this.run();
  }

  // =========================================================
  // MASTER RUNNER
  // =========================================================

  async run() {
    this.logger.log('🚀 Starting master seeder');

    await this.seedPermissions();
    await this.seedRoles();
    await this.seedFeatures();
    await this.seedPlans();
    await this.seedPlanFeatures();
    await this.seedDefaultTemplates();
    await this.seedIndianDummyProfiles();

    this.logger.log('✅ Master seeder completed');
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

    this.logger.log('✅ Indian dummy profiles seeded successfully', {
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

    this.logger.log(`✅ Permissions seeded successfully`, {
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
      .filter((permission) => permission.name.startsWith('user:'))
      .map((permission) => permission._id);

    const roles = [
      {
        name: AppRole.ADMIN,
        description: 'Super Admin',
        permissions: adminPermissionIds,
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

    this.logger.log(`✅ Roles seeded successfully`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: roles.length,
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

    this.logger.log(`✅ Features seeded successfully`, {
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

    this.logger.log(`✅ Plans seeded successfully`, {
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
      | 'PLATINUM_YEARLY';

    type FeatureValue = number | boolean | string;

    interface PlanFeatureSeed {
      planSlug: PlanSlug;
      featureKey: FeatureKey;
      value: FeatureValue;
    }

    const mappings: PlanFeatureSeed[] = [];

    // ==========================================
    // HELPER
    // ==========================================

    const addFeature = (
      planSlug: PlanSlug,
      featureKey: FeatureKey,
      value: FeatureValue = 1,
    ) => {
      mappings.push({
        planSlug,
        featureKey,
        value,
      });
    };

    // ==========================================
    // FREE PLAN
    // ==========================================

    (
      [
        [FeatureKey.CREATE_PROFILE, 1],
        [FeatureKey.EDIT_PROFILE, 1],
        [FeatureKey.UPLOAD_PHOTOS, 5],
        [FeatureKey.DAILY_LIKES, 10],
        [FeatureKey.SEND_INTEREST, 10],
        [FeatureKey.VIEW_PROFILE_PHOTOS, 1],
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
      [FeatureKey.UPLOAD_PHOTOS, 20],
      [FeatureKey.UPLOAD_VIDEOS, 5],
      [FeatureKey.UNLIMITED_LIKES, -1],
      [FeatureKey.UNLIMITED_CHAT, -1],
      [FeatureKey.SEND_INTEREST, -1],
      [FeatureKey.VIEW_INTERESTS, 1],
      [FeatureKey.ACCEPT_INTEREST, 1],
      [FeatureKey.REJECT_INTEREST, 1],
      [FeatureKey.VIEW_CONTACT, 1],
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
      [FeatureKey.ADVANCED_SEARCH, 1],
      [FeatureKey.ADVANCED_FILTERS, 1],
      [FeatureKey.UNLIMITED_SEARCH, -1],
      [FeatureKey.UNLIMITED_PROFILE_VIEWS, -1],
      [FeatureKey.WHO_VIEWED_ME, 1],
      [FeatureKey.PROFILE_ANALYTICS, 1],
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
      [FeatureKey.AD_FREE_EXPERIENCE, 1],
      [FeatureKey.PROFILE_BOOST, 2],
      [FeatureKey.DAILY_BOOSTS, 1],
      [FeatureKey.PRIORITY_SUPPORT, 1],
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

      [FeatureKey.UNLIMITED_SUPER_LIKES, -1],
      [FeatureKey.SUPER_LIKE, -1],
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
      [FeatureKey.SWIPE_LIMIT, -1],

      [FeatureKey.UNLIMITED_SWIPES, -1],
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
      ] as PlanSlug[]
    ).forEach((planSlug) => {
      platinumFeatures.forEach(([feature, value]) =>
        addFeature(planSlug, feature, value),
      );
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

    this.logger.log(`✅ Plan features mappings seeded successfully`, {
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

    this.logger.log(`✅ Notification templates seeded successfully`, {
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
    template: Partial<NotificationTemplates>,
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
