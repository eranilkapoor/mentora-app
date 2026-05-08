import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { AppLogger } from 'src/common/logger/logger.service';

import {
  Permission,
  PermissionDocument,
} from 'src/modules/admin/schemas/permission.schema';
import { Role, RoleDocument } from 'src/modules/admin/schemas/role.schema';
import {
  Permission as AppPermission,
  Role as AppRole,
  FeatureCategory,
  FeatureKey,
  PlanTier,
} from 'src/common/enums';
import { Plan, PlanDocument } from 'src/modules/plan/schemas/plan.schema';
import {
  Feature,
  FeatureDocument,
} from 'src/modules/plan/schemas/feature.schema';
import {
  PlanFeature,
  PlanFeatureDocument,
} from 'src/modules/plan/schemas/plan-feature.schema';
import {
  NotificationTemplates,
  NotificationTemplatesDocument,
} from 'src/modules/notification/schemas/notification-templates.schema';

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

    this.logger.log('✅ Master seeder completed');
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
    const features: Feature[] = [
      // ==========================================
      // 🔐 AUTH & ACCOUNT
      // ==========================================
      {
        key: FeatureKey.EMAIL_REGISTRATION,
        name: 'Email Registration',
        category: FeatureCategory.AUTH,
        description: 'Allow users to register using email',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PHONE_REGISTRATION,
        name: 'Phone Registration',
        category: FeatureCategory.AUTH,
        description: 'Allow users to register using phone number',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SOCIAL_LOGIN_GOOGLE,
        name: 'Google Login',
        category: FeatureCategory.AUTH,
        description: 'Login with Google account',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SOCIAL_LOGIN_APPLE,
        name: 'Apple Login',
        category: FeatureCategory.AUTH,
        description: 'Login with Apple account',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SOCIAL_LOGIN_FACEBOOK,
        name: 'Facebook Login',
        category: FeatureCategory.AUTH,
        description: 'Login with Facebook account',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.EMAIL_VERIFICATION,
        name: 'Email Verification',
        category: FeatureCategory.AUTH,
        description: 'Verify email address using OTP or link',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PHONE_VERIFICATION,
        name: 'Phone Verification',
        category: FeatureCategory.AUTH,
        description: 'Verify mobile number using OTP',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.OTP_LOGIN,
        name: 'OTP Login',
        category: FeatureCategory.AUTH,
        description: 'Allow login using OTP',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.TWO_FACTOR_AUTH,
        name: 'Two Factor Auth',
        category: FeatureCategory.AUTH,
        description: 'Additional security layer for login',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.DEVICE_MANAGEMENT,
        name: 'Device Management',
        category: FeatureCategory.AUTH,
        description: 'Manage logged in devices',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.MULTI_DEVICE_LOGIN,
        name: 'Multi Device Login',
        category: FeatureCategory.AUTH,
        description: 'Login from multiple devices',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SESSION_HISTORY,
        name: 'Session History',
        category: FeatureCategory.AUTH,
        description: 'View login session history',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 👤 PROFILE
      // ==========================================
      {
        key: FeatureKey.CREATE_PROFILE,
        name: 'Create Profile',
        category: FeatureCategory.PROFILE,
        description: 'Allow users to create profile',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.EDIT_PROFILE,
        name: 'Edit Profile',
        category: FeatureCategory.PROFILE,
        description: 'Allow users to edit profile',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.DELETE_PROFILE,
        name: 'Delete Profile',
        category: FeatureCategory.PROFILE,
        description: 'Allow users to delete profile',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.ADVANCED_PROFILE_COMPLETION,
        name: 'Advanced Profile Completion',
        category: FeatureCategory.PROFILE,
        description: 'Advanced profile completion features',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PROFILE_COMPLETION_SCORE,
        name: 'Profile Completion Score',
        category: FeatureCategory.PROFILE,
        description: 'Profile completion percentage score',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.MULTIPLE_PROFILE_PHOTOS,
        name: 'Multiple Profile Photos',
        category: FeatureCategory.PROFILE,
        description: 'Upload multiple profile images',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 10,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.VIDEO_PROFILE,
        name: 'Video Profile',
        category: FeatureCategory.PROFILE,
        description: 'Upload profile introduction video',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.AUDIO_INTRO,
        name: 'Audio Introduction',
        category: FeatureCategory.PROFILE,
        description: 'Upload audio introduction',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PROFILE_BOOST,
        name: 'Profile Boost',
        category: FeatureCategory.PROFILE,
        description: 'Boost profile visibility',
        type: 'quota',
        defaultValue: false,
        metadata: {
          limit: 5,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PROFILE_HIGHLIGHT,
        name: 'Profile Highlight',
        category: FeatureCategory.PROFILE,
        description: 'Highlight profile in search results',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.FEATURED_PROFILE,
        name: 'Featured Profile',
        category: FeatureCategory.PROFILE,
        description: 'Feature profile on home page',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.HIDE_PROFILE_PHOTO,
        name: 'Hide Profile Photo',
        category: FeatureCategory.PROFILE,
        description: 'Option to hide profile photo from public',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PRIVATE_PHOTOS,
        name: 'Private Photos',
        category: FeatureCategory.PROFILE,
        description: 'Keep some photos private and share with matches',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PRIVATE_ALBUM,
        name: 'Private Album',
        category: FeatureCategory.PROFILE,
        description: 'Create private photo albums for matches',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.HIDE_LAST_SEEN,
        name: 'Hide Last Seen',
        category: FeatureCategory.PROFILE,
        description: 'Option to hide last seen status',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.HIDE_ONLINE_STATUS,
        name: 'Hide Online Status',
        category: FeatureCategory.PROFILE,
        description: 'Option to hide online status',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.INCOGNITO_MODE,
        name: 'Incognito Mode',
        category: FeatureCategory.PROFILE,
        description: 'Browse profiles without being seen',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PROFILE_VERIFICATION,
        name: 'Profile Verification',
        category: FeatureCategory.PROFILE,
        description: 'Verify profile identity',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.ID_VERIFICATION,
        name: 'ID Verification',
        category: FeatureCategory.PROFILE,
        description: 'Verify identity using official ID',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.VERIFIED_BADGE,
        name: 'Verified Badge',
        category: FeatureCategory.PROFILE,
        description: 'Show verified badge on profile',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.HOROSCOPE_UPLOAD,
        name: 'Horoscope Upload',
        category: FeatureCategory.PROFILE,
        description: 'Upload horoscope details for matchmaking',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.ASTROLOGY_REPORT,
        name: 'Astrology Report',
        category: FeatureCategory.PROFILE,
        description: 'Generate astrology report based on profile details',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // ❤️ ENGAGEMENT
      // ==========================================
      {
        key: FeatureKey.DAILY_LIKES,
        name: 'Daily Likes',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Number of likes per day',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 25,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.DAILY_SUPER_LIKES,
        name: 'Daily Super Likes',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Number of super likes per day',
        type: 'limit',
        defaultValue: false,
        metadata: {
          limit: 5,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.UNLIMITED_LIKES,
        name: 'Unlimited Likes',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Unlimited profile likes',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.UNLIMITED_SUPER_LIKES,
        name: 'Unlimited Super Likes',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Unlimited super likes',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SEND_INTEREST,
        name: 'Send Interest',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Send matrimonial interest requests',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.VIEW_INTERESTS,
        name: 'View Interests',
        category: FeatureCategory.ENGAGEMENT,
        description: 'View received interest requests',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.ACCEPT_INTEREST,
        name: 'Accept Interests',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Accept received interest requests',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.REJECT_INTEREST,
        name: 'Reject Interests',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Reject received interest requests',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SUPER_LIKE,
        name: 'Super Like',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Send super like to profiles',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PRIORITY_INTEREST,
        name: 'Priority Interest',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Show interest requests at top of recipient inbox',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SHORTLIST_PROFILES,
        name: 'Shortlist Profiles',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Shortlist profiles for quick access',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 50,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.FAVORITE_PROFILES,
        name: 'Favorite Profiles',
        category: FeatureCategory.ENGAGEMENT,
        description: 'Add profiles to favorites',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 100,
        },
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 💬 CHAT & COMMUNICATION
      // ==========================================
      {
        key: FeatureKey.CHAT_ACCESS,
        name: 'Chat Access',
        category: FeatureCategory.CHAT,
        description: 'Enable messaging/chat feature',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.UNLIMITED_CHAT,
        name: 'Unlimited Chat',
        category: FeatureCategory.CHAT,
        description: 'Unlimited messages',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.CHAT_WITH_MATCHES_ONLY,
        name: 'Chat With Matches Only',
        category: FeatureCategory.CHAT,
        description: 'Allow chatting only with matched profiles',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.VOICE_CALL,
        name: 'Voice Call',
        category: FeatureCategory.CHAT,
        description: 'Voice calling feature',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.VIDEO_CALL,
        name: 'Video Call',
        category: FeatureCategory.CHAT,
        description: 'Video calling feature',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.READ_RECEIPTS,
        name: 'Read Receipts',
        category: FeatureCategory.CHAT,
        description: 'See message read status',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🔍 SEARCH & DISCOVERY
      // ==========================================
      {
        key: FeatureKey.BASIC_SEARCH,
        name: 'Basic Search',
        category: FeatureCategory.SEARCH,
        description: 'Basic profile search',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.ADVANCED_SEARCH,
        name: 'Advanced Search',
        category: FeatureCategory.SEARCH,
        description: 'Advanced profile search',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.ADVANCED_FILTERS,
        name: 'Advanced Filters',
        category: FeatureCategory.SEARCH,
        description: 'Advanced matchmaking filters',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.UNLIMITED_SEARCH,
        name: 'Unlimited Search',
        category: FeatureCategory.SEARCH,
        description: 'Unlimited searches',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.WHO_VIEWED_ME,
        name: 'Who Viewed Me',
        category: FeatureCategory.SEARCH,
        description: 'View profile visitors',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🧠 MATCHMAKING & AI
      // ==========================================
      {
        key: FeatureKey.SMART_MATCHES,
        name: 'Smart Matches',
        category: FeatureCategory.MATCHMAKING,
        description: 'AI-based smart recommendations',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.COMPATIBILITY_SCORE,
        name: 'Compatibility Score',
        category: FeatureCategory.MATCHMAKING,
        description: 'Compatibility percentage score',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.AI_RECOMMENDATIONS,
        name: 'AI Recommendations',
        category: FeatureCategory.MATCHMAKING,
        description: 'AI generated profile recommendations',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🕉️ MATRIMONY SPECIFIC
      // ==========================================
      {
        key: FeatureKey.KUNDLI_MATCHING,
        name: 'Kundli Matching',
        category: FeatureCategory.MATRIMONY,
        description: 'Astrology based kundli matching',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.RELIGION_PREFERENCES,
        name: 'Religion Preferences',
        category: FeatureCategory.MATRIMONY,
        description: 'Filter matches by religion',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.CASTE_PREFERENCES,
        name: 'Caste Preferences',
        category: FeatureCategory.MATRIMONY,
        description: 'Filter matches by caste',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 👨‍👩‍👧 FAMILY FEATURES
      // ==========================================
      {
        key: FeatureKey.FAMILY_MANAGED_PROFILE,
        name: 'Family Managed Profile',
        category: FeatureCategory.FAMILY,
        description: 'Parents or family can manage account',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.GUARDIAN_ACCESS,
        name: 'Guardian Access',
        category: FeatureCategory.FAMILY,
        description: 'Provide guardian access',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🔔 NOTIFICATIONS
      // ==========================================
      {
        key: FeatureKey.PUSH_NOTIFICATIONS,
        name: 'Push Notifications',
        category: FeatureCategory.NOTIFICATIONS,
        description: 'Mobile push notifications',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.EMAIL_NOTIFICATIONS,
        name: 'Email Notifications',
        category: FeatureCategory.NOTIFICATIONS,
        description: 'Email notifications',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // ⭐ PREMIUM EXPERIENCE
      // ==========================================
      {
        key: FeatureKey.AD_FREE_EXPERIENCE,
        name: 'Ad Free Experience',
        category: FeatureCategory.PREMIUM,
        description: 'Remove ads from app',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PRIORITY_SUPPORT,
        name: 'Priority Support',
        category: FeatureCategory.PREMIUM,
        description: 'Premium customer support',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.VIP_BADGE,
        name: 'VIP Badge',
        category: FeatureCategory.PREMIUM,
        description: 'VIP profile badge',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🚀 BOOST / MONETIZATION
      // ==========================================
      {
        key: FeatureKey.DAILY_BOOSTS,
        name: 'Daily Boosts',
        category: FeatureCategory.BOOST,
        description: 'Daily profile boosts',
        type: 'limit',
        defaultValue: false,
        metadata: {
          limit: 1,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.WEEKLY_BOOSTS,
        name: 'Weekly Boosts',
        category: FeatureCategory.BOOST,
        description: 'Weekly profile boosts',
        type: 'limit',
        defaultValue: false,
        metadata: {
          limit: 5,
        },
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 💳 PAYMENTS & SUBSCRIPTIONS
      // ==========================================
      {
        key: FeatureKey.MONTHLY_SUBSCRIPTION,
        name: 'Monthly Subscription',
        category: FeatureCategory.PAYMENTS,
        description: 'Monthly premium plan',
        type: 'duration',
        defaultValue: false,
        metadata: {
          limit: 30,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.YEARLY_SUBSCRIPTION,
        name: 'Yearly Subscription',
        category: FeatureCategory.PAYMENTS,
        description: 'Yearly premium plan',
        type: 'duration',
        defaultValue: false,
        metadata: {
          limit: 365,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.WALLET_SYSTEM,
        name: 'Wallet System',
        category: FeatureCategory.PAYMENTS,
        description: 'In-app wallet support',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🛡️ SAFETY & TRUST
      // ==========================================
      {
        key: FeatureKey.REPORT_USER,
        name: 'Report User',
        category: FeatureCategory.SAFETY,
        description: 'Report abusive profiles',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.BLOCK_USERS,
        name: 'Block Users',
        category: FeatureCategory.SAFETY,
        description: 'Block unwanted users',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.FRAUD_DETECTION,
        name: 'Fraud Detection',
        category: FeatureCategory.SAFETY,
        description: 'Detect fake/scam accounts',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 📈 LIMIT BASED FEATURES
      // ==========================================
      {
        key: FeatureKey.MESSAGE_LIMIT,
        name: 'Message Limit',
        category: FeatureCategory.LIMITS,
        description: 'Maximum messages allowed',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 50,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SHORTLIST_LIMIT,
        name: 'Shortlist Limit',
        category: FeatureCategory.LIMITS,
        description: 'Maximum shortlisted profiles',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 100,
        },
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🎮 GAMIFICATION
      // ==========================================
      {
        key: FeatureKey.DAILY_LOGIN_REWARDS,
        name: 'Daily Login Rewards',
        category: FeatureCategory.GAMIFICATION,
        description: 'Reward users for daily login',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.STREAK_REWARDS,
        name: 'Streak Rewards',
        category: FeatureCategory.GAMIFICATION,
        description: 'Rewards for login streaks',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🧾 SUPPORT
      // ==========================================
      {
        key: FeatureKey.CUSTOMER_SUPPORT_CHAT,
        name: 'Customer Support Chat',
        category: FeatureCategory.SUPPORT,
        description: 'Live support chat',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SUPPORT_TICKETS,
        name: 'Support Tickets',
        category: FeatureCategory.SUPPORT,
        description: 'Raise support tickets',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.UPLOAD_PHOTOS,
        name: 'Upload Photos',
        category: FeatureCategory.MEDIA,
        description: 'Allow users to upload profile photos',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 5,
        },
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.VIEW_PROFILE_PHOTOS,
        name: 'View Profile Photos',
        category: FeatureCategory.MEDIA,
        description: 'Allow users to view profile photos',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.BASIC_FILTERS,
        name: 'Basic Filters',
        category: FeatureCategory.SEARCH,
        description: 'Enable basic search and matchmaking filters',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.MATCH_LIMIT,
        name: 'Match Limit',
        category: FeatureCategory.LIMITS,
        description: 'Maximum number of matches allowed',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 20,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.DAILY_PROFILE_VIEWS,
        name: 'Daily Profile Views',
        category: FeatureCategory.SEARCH,
        description: 'Maximum number of profile views allowed per day',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 25,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.UPLOAD_VIDEOS,
        name: 'Upload Videos',
        category: FeatureCategory.MEDIA,
        description: 'Allow users to upload videos',
        type: 'limit',
        defaultValue: false,
        metadata: {
          limit: 5,
        },
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.VIEW_CONTACT,
        name: 'View Contact',
        category: FeatureCategory.CONTACT_ACCESS,
        description: 'Allow users to view contact details',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.VIEW_PHONE_NUMBER,
        name: 'View Phone Number',
        category: FeatureCategory.CONTACT_ACCESS,
        description: 'Allow users to view phone numbers',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.VIEW_EMAIL_ADDRESS,
        name: 'View Email Address',
        category: FeatureCategory.CONTACT_ACCESS,
        description: 'Allow users to view email addresses',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.TYPING_INDICATOR,
        name: 'Typing Indicator',
        category: FeatureCategory.CHAT,
        description: 'Show typing status in chat',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.SEND_IMAGES_IN_CHAT,
        name: 'Send Images In Chat',
        category: FeatureCategory.CHAT,
        description: 'Allow users to send images in chat',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.SEND_VOICE_NOTES,
        name: 'Send Voice Notes',
        category: FeatureCategory.CHAT,
        description: 'Allow users to send voice notes',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.VIEW_PRIVATE_PHOTOS,
        name: 'View Private Photos',
        category: FeatureCategory.MEDIA,
        description: 'Allow users to view private photos',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.UNLIMITED_PROFILE_VIEWS,
        name: 'Unlimited Profile Views',
        category: FeatureCategory.SEARCH,
        description: 'Allow unlimited profile views',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.PROFILE_ANALYTICS,
        name: 'Profile Analytics',
        category: FeatureCategory.SEARCH,
        description: 'View profile analytics and statistics',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.TOP_IN_SEARCH,
        name: 'Top In Search',
        category: FeatureCategory.SEARCH,
        description: 'Show profile at top in search results',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.SHOW_ON_HOME,
        name: 'Show On Home',
        category: FeatureCategory.SEARCH,
        description: 'Show profile on home recommendations',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.MANGLIK_MATCHING,
        name: 'Manglik Matching',
        category: FeatureCategory.MATRIMONY,
        description: 'Enable manglik compatibility matching',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.FAMILY_DETAILS,
        name: 'Family Details',
        category: FeatureCategory.FAMILY,
        description: 'Allow users to add family details',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.CHAT_WITHOUT_MATCH,
        name: 'Chat Without Match',
        category: FeatureCategory.CHAT,
        description: 'Allow chatting without matching first',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.PRIORITY_CHAT,
        name: 'Priority Chat',
        category: FeatureCategory.CHAT,
        description: 'Prioritize chats in inbox',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.MESSAGE_TRANSLATION,
        name: 'Message Translation',
        category: FeatureCategory.CHAT,
        description: 'Translate chat messages automatically',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.SEND_VIDEOS_IN_CHAT,
        name: 'Send Videos In Chat',
        category: FeatureCategory.CHAT,
        description: 'Allow users to send videos in chat',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.DIRECT_CONTACT_ACCESS,
        name: 'Direct Contact Access',
        category: FeatureCategory.CONTACT_ACCESS,
        description: 'Allow direct access to contact information',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.REQUEST_PRIVATE_VIDEOS,
        name: 'Request Private Videos',
        category: FeatureCategory.MEDIA,
        description: 'Allow requesting access to private videos',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.AI_PHOTO_VERIFICATION,
        name: 'AI Photo Verification',
        category: FeatureCategory.MEDIA,
        description: 'AI based profile photo verification',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.BLURRED_PHOTO_MODE,
        name: 'Blurred Photo Mode',
        category: FeatureCategory.MEDIA,
        description: 'Blur photos until access is granted',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.GLOBAL_SEARCH,
        name: 'Global Search',
        category: FeatureCategory.SEARCH,
        description: 'Search profiles globally',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.INTERNATIONAL_MATCHES,
        name: 'International Matches',
        category: FeatureCategory.SEARCH,
        description: 'Find international profile matches',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.NRI_MATCHING,
        name: 'NRI Matching',
        category: FeatureCategory.SEARCH,
        description: 'Enable NRI matchmaking',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.SAVED_SEARCHES,
        name: 'Saved Searches',
        category: FeatureCategory.SEARCH,
        description: 'Save search filters and preferences',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 20,
        },
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.RECENT_SEARCHES,
        name: 'Recent Searches',
        category: FeatureCategory.SEARCH,
        description: 'View recent search history',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.FEATURED_IN_SEARCH,
        name: 'Featured In Search',
        category: FeatureCategory.SEARCH,
        description: 'Feature profile in search results',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.PRIORITY_SEARCH_RANKING,
        name: 'Priority Search Ranking',
        category: FeatureCategory.SEARCH,
        description: 'Higher ranking in search results',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.ADVANCED_MATCHING,
        name: 'Advanced Matching',
        category: FeatureCategory.MATCHMAKING,
        description: 'Advanced AI matchmaking engine',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.AI_PROFILE_SUMMARY,
        name: 'AI Profile Summary',
        category: FeatureCategory.MATCHMAKING,
        description: 'Generate AI based profile summaries',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.AI_PHOTO_SELECTION,
        name: 'AI Photo Selection',
        category: FeatureCategory.MATCHMAKING,
        description: 'AI suggests best profile photos',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.AI_COMPATIBILITY_ANALYSIS,
        name: 'AI Compatibility Analysis',
        category: FeatureCategory.MATCHMAKING,
        description: 'AI based compatibility analysis',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.AI_CONVERSATION_STARTER,
        name: 'AI Conversation Starter',
        category: FeatureCategory.MATCHMAKING,
        description: 'AI generated conversation suggestions',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.AI_INTEREST_PREDICTION,
        name: 'AI Interest Prediction',
        category: FeatureCategory.MATCHMAKING,
        description: 'Predict user interests using AI',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.AI_FAKE_PROFILE_DETECTION,
        name: 'AI Fake Profile Detection',
        category: FeatureCategory.MATCHMAKING,
        description: 'Detect fake profiles using AI',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.PERSONALITY_MATCHING,
        name: 'Personality Matching',
        category: FeatureCategory.MATCHMAKING,
        description: 'Match users based on personality',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.INTEREST_MATCHING,
        name: 'Interest Matching',
        category: FeatureCategory.MATCHMAKING,
        description: 'Match users based on interests',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.LOCATION_MATCHING,
        name: 'Location Matching',
        category: FeatureCategory.MATCHMAKING,
        description: 'Match users based on location',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.STRICT_PREFERENCES,
        name: 'Strict Preferences',
        category: FeatureCategory.MATCHMAKING,
        description: 'Apply strict matchmaking preferences',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.SMART_PREFERENCES,
        name: 'Smart Preferences',
        category: FeatureCategory.MATCHMAKING,
        description: 'AI optimized matchmaking preferences',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.SUBCASTE_PREFERENCES,
        name: 'Subcaste Preferences',
        category: FeatureCategory.MATRIMONY,
        description: 'Filter matches by subcaste',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.COMMUNITY_BASED_MATCHING,
        name: 'Community Based Matching',
        category: FeatureCategory.MATRIMONY,
        description: 'Find matches within community',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.MARRIAGE_TIMELINE_PREFERENCE,
        name: 'Marriage Timeline Preference',
        category: FeatureCategory.MATRIMONY,
        description: 'Set preferred marriage timeline',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.CHILDREN_PREFERENCE,
        name: 'Children Preference',
        category: FeatureCategory.MATRIMONY,
        description: 'Set children related preferences',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.DIET_PREFERENCES,
        name: 'Diet Preferences',
        category: FeatureCategory.MATRIMONY,
        description: 'Filter matches by diet preferences',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      {
        key: FeatureKey.LIFESTYLE_PREFERENCES,
        name: 'Lifestyle Preferences',
        category: FeatureCategory.MATRIMONY,
        description: 'Filter matches by lifestyle preferences',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      // ==========================================
      // 👨‍👩‍👧 FAMILY FEATURES
      // ==========================================

      {
        key: FeatureKey.PARENT_LOGIN,
        name: 'Parent Login',
        category: FeatureCategory.FAMILY,
        description: 'Allow parents to login and manage profile',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.FAMILY_PREFERENCES,
        name: 'Family Preferences',
        category: FeatureCategory.FAMILY,
        description: 'Set family based partner preferences',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 📊 ANALYTICS
      // ==========================================

      {
        key: FeatureKey.INTEREST_ANALYTICS,
        name: 'Interest Analytics',
        category: FeatureCategory.ANALYTICS,
        description: 'Track sent and received interest analytics',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.CHAT_ANALYTICS,
        name: 'Chat Analytics',
        category: FeatureCategory.ANALYTICS,
        description: 'Analyze chat engagement and activity',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.ENGAGEMENT_SCORE,
        name: 'Engagement Score',
        category: FeatureCategory.ANALYTICS,
        description: 'User engagement scoring system',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.MATCH_SUCCESS_RATE,
        name: 'Match Success Rate',
        category: FeatureCategory.ANALYTICS,
        description: 'Track successful matchmaking rate',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.WEEKLY_REPORTS,
        name: 'Weekly Reports',
        category: FeatureCategory.ANALYTICS,
        description: 'Receive weekly analytics reports',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🔔 NOTIFICATIONS
      // ==========================================

      {
        key: FeatureKey.SMS_NOTIFICATIONS,
        name: 'SMS Notifications',
        category: FeatureCategory.NOTIFICATIONS,
        description: 'Receive SMS notifications',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.INSTANT_MATCH_ALERTS,
        name: 'Instant Match Alerts',
        category: FeatureCategory.NOTIFICATIONS,
        description: 'Get instant alerts for new matches',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.DAILY_MATCH_DIGEST,
        name: 'Daily Match Digest',
        category: FeatureCategory.NOTIFICATIONS,
        description: 'Receive daily match summary notifications',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🌍 LOCATION FEATURES
      // ==========================================

      {
        key: FeatureKey.LOCATION_BASED_MATCHING,
        name: 'Location Based Matching',
        category: FeatureCategory.LOCATION,
        description: 'Match profiles based on location',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.NEARBY_PROFILES,
        name: 'Nearby Profiles',
        category: FeatureCategory.LOCATION,
        description: 'Discover nearby profiles',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.TRAVEL_MODE,
        name: 'Travel Mode',
        category: FeatureCategory.LOCATION,
        description: 'Enable matching while travelling',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // ⭐ PREMIUM EXPERIENCE
      // ==========================================

      {
        key: FeatureKey.PREMIUM_BADGE,
        name: 'Premium Badge',
        category: FeatureCategory.PREMIUM,
        description: 'Display premium badge on profile',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.RELATIONSHIP_MANAGER,
        name: 'Relationship Manager',
        category: FeatureCategory.PREMIUM,
        description: 'Access dedicated relationship manager',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.DEDICATED_RELATIONSHIP_MANAGER,
        name: 'Dedicated Relationship Manager',
        category: FeatureCategory.PREMIUM,
        description: 'Personal relationship manager support',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.CONCIERGE_MATCHMAKING,
        name: 'Concierge Matchmaking',
        category: FeatureCategory.PREMIUM,
        description: 'Premium concierge matchmaking service',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PERSONAL_MATCHMAKER,
        name: 'Personal Matchmaker',
        category: FeatureCategory.PREMIUM,
        description: 'Assign personal matchmaker',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🚀 BOOST / MONETIZATION
      // ==========================================

      {
        key: FeatureKey.MONTHLY_BOOSTS,
        name: 'Monthly Boosts',
        category: FeatureCategory.BOOST,
        description: 'Monthly profile boosts',
        type: 'limit',
        defaultValue: false,
        metadata: {
          limit: 30,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.UNLIMITED_BOOSTS,
        name: 'Unlimited Boosts',
        category: FeatureCategory.BOOST,
        description: 'Unlimited profile boosts',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SPOTLIGHT_PROFILE,
        name: 'Spotlight Profile',
        category: FeatureCategory.BOOST,
        description: 'Feature profile in spotlight section',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 💳 PAYMENTS & SUBSCRIPTIONS
      // ==========================================

      {
        key: FeatureKey.PROMO_CODES,
        name: 'Promo Codes',
        category: FeatureCategory.PAYMENTS,
        description: 'Apply promotional discount codes',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.REFERRAL_REWARDS,
        name: 'Referral Rewards',
        category: FeatureCategory.PAYMENTS,
        description: 'Earn rewards through referrals',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.REFERRAL_BONUS,
        name: 'Referral Bonus',
        category: FeatureCategory.PAYMENTS,
        description: 'Receive bonus on successful referrals',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.EARN_CREDITS,
        name: 'Earn Credits',
        category: FeatureCategory.PAYMENTS,
        description: 'Earn credits through engagement',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🛡️ SAFETY & TRUST
      // ==========================================

      {
        key: FeatureKey.SAFE_MODE,
        name: 'Safe Mode',
        category: FeatureCategory.SAFETY,
        description: 'Enhanced safety and privacy mode',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SPAM_DETECTION,
        name: 'Spam Detection',
        category: FeatureCategory.SAFETY,
        description: 'Detect spam and suspicious activity',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.MANUAL_PROFILE_REVIEW,
        name: 'Manual Profile Review',
        category: FeatureCategory.SAFETY,
        description: 'Profiles reviewed manually by moderators',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 📈 LIMIT BASED FEATURES
      // ==========================================

      {
        key: FeatureKey.CONTACT_VIEW_LIMIT,
        name: 'Contact View Limit',
        category: FeatureCategory.LIMITS,
        description: 'Maximum contact views allowed',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 25,
        },
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.SWIPE_LIMIT,
        name: 'Swipe Limit',
        category: FeatureCategory.LIMITS,
        description: 'Maximum swipes allowed per day',
        type: 'limit',
        defaultValue: true,
        metadata: {
          limit: 50,
        },
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🎮 ENGAGEMENT & GAMIFICATION
      // ==========================================

      {
        key: FeatureKey.UNLIMITED_SWIPES,
        name: 'Unlimited Swipes',
        category: FeatureCategory.GAMIFICATION,
        description: 'Unlimited profile swipes',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.MATCH_QUIZ,
        name: 'Match Quiz',
        category: FeatureCategory.GAMIFICATION,
        description: 'Interactive matchmaking quizzes',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.COMPATIBILITY_GAMES,
        name: 'Compatibility Games',
        category: FeatureCategory.GAMIFICATION,
        description: 'Play games to check compatibility',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🧾 SUPPORT & MISC
      // ==========================================

      {
        key: FeatureKey.ACCOUNT_EXPORT,
        name: 'Account Export',
        category: FeatureCategory.SUPPORT,
        description: 'Export account related data',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.DATA_EXPORT,
        name: 'Data Export',
        category: FeatureCategory.SUPPORT,
        description: 'Download personal data export',
        type: 'boolean',
        defaultValue: false,
        isActive: true,
        version: 1,
      },
      {
        key: FeatureKey.PRIVACY_CONTROLS,
        name: 'Privacy Controls',
        category: FeatureCategory.SUPPORT,
        description: 'Advanced privacy management controls',
        type: 'boolean',
        defaultValue: true,
        isActive: true,
        version: 1,
      },
    ];

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
    const plans: Plan[] = [
      // ==========================================
      // 🆓 FREE PLAN
      // ==========================================
      {
        name: 'FREE',
        slug: 'free',
        tier: PlanTier.FREE,
        price: 0,
        durationDays: 3650,
        currency: 'INR',
        isPopular: false,
        sortOrder: 1,
        description: 'Basic free membership with limited matchmaking access.',
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🥇 GOLD MONTHLY
      // ==========================================
      {
        name: 'GOLD_MONTHLY',
        slug: 'gold-monthly',
        tier: PlanTier.GOLD,
        price: 999,
        durationDays: 30,
        currency: 'INR',
        isPopular: true,
        sortOrder: 2,
        description:
          'Gold monthly subscription with unlimited likes, chat, and advanced filters.',
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🥇 GOLD QUARTERLY
      // ==========================================
      {
        name: 'GOLD_QUARTERLY',
        slug: 'gold-quarterly',
        tier: PlanTier.GOLD,
        price: 2499,
        durationDays: 90,
        currency: 'INR',
        isPopular: false,
        sortOrder: 3,
        description:
          'Gold quarterly subscription with premium matchmaking benefits.',
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 🥇 GOLD YEARLY
      // ==========================================
      {
        name: 'GOLD_YEARLY',
        slug: 'gold-yearly',
        tier: PlanTier.GOLD,
        price: 7999,
        durationDays: 365,
        currency: 'INR',
        isPopular: false,
        sortOrder: 4,
        description:
          'Gold yearly subscription with maximum savings and premium access.',
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 💎 PLATINUM MONTHLY
      // ==========================================
      {
        name: 'PLATINUM_MONTHLY',
        slug: 'platinum-monthly',
        tier: PlanTier.PLATINUM,
        price: 2499,
        durationDays: 30,
        currency: 'INR',
        isPopular: false,
        sortOrder: 5,
        description:
          'Platinum monthly subscription with AI matchmaking and priority ranking.',
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 💎 PLATINUM QUARTERLY
      // ==========================================
      {
        name: 'PLATINUM_QUARTERLY',
        slug: 'platinum-quarterly',
        tier: PlanTier.PLATINUM,
        price: 6499,
        durationDays: 90,
        currency: 'INR',
        isPopular: true,
        sortOrder: 6,
        description:
          'Platinum quarterly plan with concierge matchmaking and premium visibility.',
        isActive: true,
        version: 1,
      },

      // ==========================================
      // 💎 PLATINUM YEARLY
      // ==========================================
      {
        name: 'PLATINUM_YEARLY',
        slug: 'platinum-yearly',
        tier: PlanTier.PLATINUM,
        price: 19999,
        durationDays: 365,
        currency: 'INR',
        isPopular: false,
        sortOrder: 7,
        description:
          'Ultimate yearly platinum experience with all premium features unlocked.',
        isActive: true,
        version: 1,
      },
    ];

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
      [FeatureKey.DIET_PREFERENCES, 1],
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
    const defaults: Partial<NotificationTemplates>[] = [
      {
        key: 'INTEREST_RECEIVED',
        eventKey: 'interest.received',
        locale: 'en',
        name: 'Interest Received',
        category: 'interest_received',
        priority: 'normal',
        title: 'New interest from {{name}}',
        message: '{{name}} has sent you an interest.',
        pushTitle: 'You received a new interest',
        pushBody: '{{name}} sent you an interest.',
        emailSubject: 'You got a new interest on MatchMate',
        emailBody:
          'Hi {{userName}}, you received a new interest from {{name}}.',
        smsBody: 'New interest from {{name}} on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 5,
          maxPerDay: 20,
        },
        deepLink: 'matchmate://interests/received',
        tags: ['engagement', 'interest'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'INTEREST_ACCEPTED',
        eventKey: 'interest.accepted',
        locale: 'en',
        name: 'Interest Accepted',
        category: 'interest_accepted',
        priority: 'high',
        title: '{{name}} accepted your interest',
        message: 'Great news! {{name}} accepted your interest.',
        pushTitle: 'Interest accepted',
        pushBody: '{{name}} accepted your interest.',
        emailSubject: 'Your interest was accepted',
        emailBody:
          'Hi {{userName}}, {{name}} accepted your interest. Start chatting now.',
        smsBody: '{{name}} accepted your interest on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 5,
          maxPerDay: 20,
        },
        deepLink: 'matchmate://interests/sent',
        tags: ['engagement', 'interest'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'INTEREST_REMINDER',
        eventKey: 'interest.reminder',
        locale: 'en',
        name: 'Interest Response Reminder',
        category: 'interest_received',
        priority: 'normal',
        title: 'You have pending interests',
        message:
          'You have {{pendingCount}} pending interests waiting for response.',
        pushTitle: 'Pending interests',
        pushBody: '{{pendingCount}} interests are waiting for your response.',
        emailSubject: 'Respond to your pending interests',
        emailBody:
          'Hi {{userName}}, you have {{pendingCount}} pending interests.',
        smsBody: 'You have {{pendingCount}} pending interests on MatchMate.',
        variables: ['pendingCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 5,
          maxPerDay: 20,
        },
        deepLink: 'matchmate://interests/pending',
        tags: ['engagement', 'interest'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'MATCH_FOUND',
        eventKey: 'match.found',
        locale: 'en',
        name: 'Match Found',
        category: 'match_found',
        priority: 'high',
        title: "It's a match with {{name}}",
        message: 'You and {{name}} are now matched. Start a conversation now.',
        pushTitle: "It's a match",
        pushBody: 'You matched with {{name}}.',
        emailSubject: 'You have a new match',
        emailBody: 'You matched with {{name}}. Open MatchMate to connect.',
        smsBody: 'You matched with {{name}} on MatchMate.',
        variables: ['name'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 5,
          maxPerDay: 20,
        },
        deepLink: 'matchmate://matches',
        tags: ['engagement', 'match'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'MATCH_REMINDER',
        eventKey: 'match.reminder',
        locale: 'en',
        name: 'Match Follow-up Reminder',
        category: 'match_found',
        priority: 'normal',
        title: 'Reconnect with {{name}}',
        message: '{{name}} is waiting to hear from you. Send a message now.',
        pushTitle: 'Your match is waiting',
        pushBody: 'Send a message to {{name}}.',
        emailSubject: 'Reconnect with your match',
        emailBody:
          'Hi {{userName}}, your match {{name}} is waiting for your reply.',
        smsBody: '{{name}} is waiting for your message on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 5,
          maxPerDay: 20,
        },
        deepLink: 'matchmate://matches',
        tags: ['engagement', 'match'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'NEW_MATCHES_DIGEST',
        eventKey: 'new.matches.digest',
        locale: 'en',
        name: 'New Matches Digest',
        category: 'match_found',
        priority: 'normal',
        title: 'You have {{matchCount}} new compatible matches',
        message:
          'Your profile matched with {{matchCount}} new people this week.',
        pushTitle: 'New matches for you',
        pushBody: '{{matchCount}} new compatible matches found.',
        emailSubject: 'Your weekly match digest',
        emailBody:
          'Hi {{userName}}, you have {{matchCount}} new compatible matches.',
        smsBody: '{{matchCount}} new matches are waiting on MatchMate.',
        variables: ['matchCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 5,
          maxPerDay: 1,
        },
        deepLink: 'matchmate://matches',
        tags: ['engagement', 'match', 'digest'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'MESSAGE_RECEIVED',
        eventKey: 'message.received',
        locale: 'en',
        name: 'Message Received',
        category: 'message_received',
        priority: 'normal',
        title: 'New message from {{name}}',
        message: '{{name}}: {{messagePreview}}',
        pushTitle: 'New message',
        pushBody: '{{name}} sent you a message.',
        emailSubject: 'You received a new message',
        emailBody: 'You have a new message from {{name}}.',
        smsBody: 'New message from {{name}} on MatchMate.',
        variables: ['name', 'messagePreview'],
        channels: { inApp: true, push: true, email: false, sms: false },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://messages',
        tags: ['engagement', 'message'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'UNREAD_MESSAGES_REMINDER',
        eventKey: 'unread.messages.reminder',
        locale: 'en',
        name: 'Unread Messages Reminder',
        category: 'message_received',
        priority: 'normal',
        title: 'You have {{unreadCount}} unread messages',
        message: 'Open MatchMate to respond to your pending conversations.',
        pushTitle: 'Unread messages waiting',
        pushBody: '{{unreadCount}} unread messages are waiting for you.',
        emailSubject: 'You have unread messages',
        emailBody: 'Hi {{userName}}, you have {{unreadCount}} unread messages.',
        smsBody: 'You have unread messages on MatchMate.',
        variables: ['unreadCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 5,
          maxPerDay: 1,
        },
        deepLink: 'matchmate://messages',
        tags: ['engagement', 'message'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'CHAT_INACTIVE_REMINDER',
        eventKey: 'chat.inactive.reminder',
        locale: 'en',
        name: 'Inactive Chat Reminder',
        category: 'message_received',
        priority: 'low',
        title: 'Your conversation with {{name}} is quiet',
        message:
          'Break the ice again and continue your conversation with {{name}}.',
        pushTitle: 'Continue your chat',
        pushBody: 'Say hello to {{name}}.',
        emailSubject: 'Continue your conversation',
        emailBody: 'Hi {{userName}}, continue your conversation with {{name}}.',
        smsBody: 'Continue your chat with {{name}} on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 60 * 24, // 24 hours
          maxPerDay: 1,
        },
        deepLink: 'matchmate://messages',
        tags: ['engagement', 'message', 'reminder'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PROFILE_VIEW_MILESTONE',
        eventKey: 'profile.view.milestone',
        locale: 'en',
        name: 'Profile View Milestone',
        category: 'profile_view',
        priority: 'normal',
        title: 'Your profile got {{viewCount}} views',
        message:
          'Your profile is trending. Update details to improve responses.',
        pushTitle: 'Profile activity is up',
        pushBody: 'Your profile reached {{viewCount}} views.',
        emailSubject: 'Your profile is getting attention',
        emailBody: 'Hi {{userName}}, your profile crossed {{viewCount}} views.',
        variables: ['viewCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://messages',
        tags: ['engagement', 'profile'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PROFILE_COMPLETION_REMINDER',
        eventKey: 'profile.completion.reminder',
        locale: 'en',
        name: 'Profile Completion Reminder',
        category: 'system',
        priority: 'normal',
        title: 'Complete your profile to get better matches',
        message:
          'Your profile is {{completionPercent}}% complete. Add details to improve match quality.',
        pushTitle: 'Complete your profile',
        pushBody: 'Profile is {{completionPercent}}% complete.',
        emailSubject: 'Complete your MatchMate profile',
        emailBody:
          'Hi {{userName}}, complete your profile to improve visibility and matches.',
        smsBody: 'Complete your MatchMate profile for better matches.',
        variables: ['completionPercent', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 60 * 24, // 24 hours
          maxPerDay: 1,
        },
        deepLink: 'matchmate://profile/edit',
        tags: ['engagement', 'profile', 'reminder'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'ID_VERIFICATION_APPROVED',
        eventKey: 'id.verification.approved',
        locale: 'en',
        name: 'ID Verification Approved',
        category: 'system',
        priority: 'high',
        title: 'Your profile verification is approved',
        message:
          'Your identity verification is complete. Your trust badge is now visible.',
        pushTitle: 'Verification approved',
        pushBody: 'Your verified badge is now active.',
        emailSubject: 'Verification approved on MatchMate',
        emailBody:
          'Hi {{userName}}, your profile verification has been approved.',
        smsBody: 'Your MatchMate profile verification is approved.',
        variables: ['userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://profile/verify',
        tags: ['verification', 'system'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'ID_VERIFICATION_REJECTED',
        eventKey: 'id.verification.rejected',
        locale: 'en',
        name: 'ID Verification Rejected',
        category: 'system',
        priority: 'high',
        title: 'Verification needs attention',
        message: 'Verification was not approved. Reason: {{reason}}',
        pushTitle: 'Verification action required',
        pushBody: 'Please re-submit your documents.',
        emailSubject: 'Action needed: verification failed',
        emailBody:
          'Hi {{userName}}, verification was not approved. Reason: {{reason}}.',
        smsBody:
          'Verification failed on MatchMate. Please re-submit documents.',
        variables: ['userName', 'reason'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://profile/verify',
        tags: ['verification', 'system'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PHOTO_APPROVED',
        eventKey: 'photo.approved',
        locale: 'en',
        name: 'Photo Approved',
        category: 'system',
        priority: 'normal',
        title: 'Your photo was approved',
        message: 'Your profile photo is now visible to potential matches.',
        pushTitle: 'Photo approved',
        pushBody: 'Your profile photo is now live.',
        emailSubject: 'Profile photo approved',
        emailBody: 'Hi {{userName}}, your new profile photo has been approved.',
        smsBody: 'Your MatchMate profile photo was approved.',
        variables: ['userName'],
        channels: { inApp: true, push: true, email: false, sms: false },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://profile/edit',
        tags: ['engagement', 'profile', 'reminder'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PHOTO_REJECTED',
        eventKey: 'photo.rejected',
        locale: 'en',
        name: 'Photo Rejected',
        category: 'system',
        priority: 'normal',
        title: 'Photo could not be approved',
        message: 'Please upload another photo that meets profile guidelines.',
        pushTitle: 'Photo upload required',
        pushBody: 'Please upload a new profile photo.',
        emailSubject: 'Photo update needed',
        emailBody:
          'Hi {{userName}}, your uploaded photo could not be approved.',
        smsBody: 'Your MatchMate photo was rejected. Upload a new one.',
        variables: ['userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://profile/edit',
        tags: ['engagement', 'profile', 'reminder'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'SUBSCRIPTION_RENEWAL',
        eventKey: 'subscription.renewal',
        locale: 'en',
        name: 'Subscription Renewal',
        category: 'subscription',
        priority: 'high',
        title: 'Your {{planName}} plan renews soon',
        message: 'Your {{planName}} plan renews on {{renewalDate}}.',
        pushTitle: 'Plan renewal reminder',
        pushBody: '{{planName}} renews on {{renewalDate}}.',
        emailSubject: 'Subscription renewal reminder',
        emailBody: 'Your {{planName}} plan renews on {{renewalDate}}.',
        smsBody: '{{planName}} plan renews on {{renewalDate}}.',
        variables: ['planName', 'renewalDate'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://subscription',
        tags: ['subscription'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'SUBSCRIPTION_EXPIRED',
        eventKey: 'subscription.expired',
        locale: 'en',
        name: 'Subscription Expired',
        category: 'subscription',
        priority: 'high',
        title: 'Your {{planName}} plan has expired',
        message: 'Renew your plan to keep premium features active.',
        pushTitle: 'Subscription expired',
        pushBody: 'Renew your {{planName}} plan now.',
        emailSubject: 'Your subscription has expired',
        emailBody:
          'Hi {{userName}}, your {{planName}} subscription has expired.',
        smsBody: 'Your {{planName}} subscription expired. Renew on MatchMate.',
        variables: ['planName', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://subscription',
        tags: ['subscription'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PAYMENT_SUCCESS',
        eventKey: 'payment.success',
        locale: 'en',
        name: 'Payment Successful',
        category: 'subscription',
        priority: 'normal',
        title: 'Payment successful for {{planName}}',
        message:
          'Your payment of {{amount}} was successful. Transaction: {{transactionId}}.',
        pushTitle: 'Payment successful',
        pushBody: '{{amount}} payment received for {{planName}}.',
        emailSubject: 'Payment receipt - MatchMate',
        emailBody:
          'Hi {{userName}}, payment {{transactionId}} for {{planName}} was successful.',
        smsBody:
          'Payment successful: {{amount}} for {{planName}} on MatchMate.',
        variables: ['planName', 'amount', 'transactionId', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://subscription',
        tags: ['subscription', 'payment'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PAYMENT_FAILED',
        eventKey: 'payment.failed',
        locale: 'en',
        name: 'Payment Failed',
        category: 'subscription',
        priority: 'high',
        title: 'Payment failed for {{planName}}',
        message:
          'We could not process your payment. Please retry to continue premium benefits.',
        pushTitle: 'Payment failed',
        pushBody: 'Please retry your payment for {{planName}}.',
        emailSubject: 'Payment failed - action needed',
        emailBody:
          'Hi {{userName}}, payment for {{planName}} failed. Please retry.',
        smsBody: 'Payment failed for {{planName}} on MatchMate. Retry now.',
        variables: ['planName', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://subscription',
        tags: ['subscription', 'payment'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PROMO_OFFER',
        eventKey: 'promo.offer',
        locale: 'en',
        name: 'Promotional Offer',
        category: 'system',
        priority: 'low',
        title: '{{discount}}% off on {{planName}}',
        message: 'Limited period offer valid until {{validTill}}. Upgrade now.',
        pushTitle: 'Special offer for you',
        pushBody: '{{discount}}% off expires on {{validTill}}.',
        emailSubject: 'Exclusive MatchMate offer inside',
        emailBody:
          'Hi {{userName}}, enjoy {{discount}}% off on {{planName}} till {{validTill}}.',
        smsBody:
          '{{discount}}% off on {{planName}} till {{validTill}}. MatchMate.',
        variables: ['discount', 'planName', 'validTill', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://subscription',
        tags: ['system', 'promotion'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'PASSWORD_CHANGED',
        eventKey: 'password.changed',
        locale: 'en',
        name: 'Password Changed',
        category: 'system',
        priority: 'critical',
        title: 'Your password was changed',
        message: 'If this was not you, secure your account immediately.',
        pushTitle: 'Security alert',
        pushBody: 'Your account password was changed.',
        emailSubject: 'Security alert: password changed',
        emailBody:
          'Hi {{userName}}, your password was changed on {{changedAt}}.',
        smsBody: 'Security alert: your MatchMate password was changed.',
        variables: ['userName', 'changedAt'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://profile/security',
        tags: ['security', 'system'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'NEW_DEVICE_LOGIN',
        eventKey: 'new.device.login',
        locale: 'en',
        name: 'New Device Login',
        category: 'system',
        priority: 'critical',
        title: 'New login detected',
        message: 'New login from {{device}} at {{location}} on {{loginTime}}.',
        pushTitle: 'New device login',
        pushBody: 'Login detected from {{device}}.',
        emailSubject: 'New login detected on your account',
        emailBody:
          'Hi {{userName}}, we noticed a login from {{device}} in {{location}}.',
        smsBody: 'New login detected on MatchMate from {{device}}.',
        variables: ['userName', 'device', 'location', 'loginTime'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://profile/security',
        tags: ['security', 'system'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'ACCOUNT_BLOCKED',
        eventKey: 'account.blocked',
        locale: 'en',
        name: 'Account Blocked',
        category: 'system',
        priority: 'critical',
        title: 'Your account is temporarily restricted',
        message: 'Your account has been restricted. Reason: {{reason}}.',
        pushTitle: 'Account restricted',
        pushBody: 'Open app for details on account status.',
        emailSubject: 'Account restriction notice',
        emailBody:
          'Hi {{userName}}, your account is restricted. Reason: {{reason}}.',
        smsBody:
          'Your MatchMate account is restricted. Check email for details.',
        variables: ['userName', 'reason'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://profile/security',
        tags: ['security', 'system'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'SAFETY_ALERT',
        eventKey: 'safety.alert',
        locale: 'en',
        name: 'Safety Alert',
        category: 'system',
        priority: 'critical',
        title: 'Important safety alert',
        message: '{{alertMessage}}',
        pushTitle: 'Safety alert',
        pushBody: '{{alertMessage}}',
        emailSubject: 'Important safety notice from MatchMate',
        emailBody: 'Hi {{userName}}, {{alertMessage}}',
        smsBody: '{{alertMessage}}',
        variables: ['userName', 'alertMessage'],
        channels: { inApp: true, push: true, email: true, sms: true },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://safety',
        tags: ['safety', 'system'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
      {
        key: 'SYSTEM_ANNOUNCEMENT',
        eventKey: 'system.announcement',
        locale: 'en',
        name: 'System Announcement',
        category: 'system',
        priority: 'normal',
        title: '{{title}}',
        message: '{{message}}',
        pushTitle: '{{title}}',
        pushBody: '{{message}}',
        emailSubject: '{{title}}',
        emailBody: '{{message}}',
        smsBody: '{{message}}',
        variables: ['title', 'message'],
        channels: { inApp: true, push: true, email: true, sms: false },
        deliveryRules: {
          cooldownMinutes: 1,
          maxPerDay: 100,
        },
        deepLink: 'matchmate://system/announcement',
        tags: ['system'],
        mandatory: false,
        status: 'active',
        isActive: true,
        createdBy: 'system',
      },
    ];

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
