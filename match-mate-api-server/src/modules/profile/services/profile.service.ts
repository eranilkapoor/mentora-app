import {
  Injectable,
  BadRequestException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ProfileRepository } from '../repositories/profile.repository';
import {
  CreateProfileDto,
  PersonalDto,
  PhysicalDto,
  EducationDto,
  FamilyDto,
} from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import type { ICacheService } from 'src/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/interfaces/cache.interface';
import { NotificationService } from '../../notification/services/notification.service';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import {
  AnalyticsEventType,
  AnalyticsPlatform,
} from '../../analytics/enums/analytics-event.enum';
import {
  ActivityAction,
  ActivityCategory,
  ActivityLog,
  ActivityLogDocument,
  ActivityPlatform,
} from '../schemas/settings/activity-logs.schema';
import {
  PrivacySetting,
  PrivacySettingDocument,
} from '../schemas/settings/privacy-setting.schema';
import { UpdatePrivacySettingsDto } from '../dto/privacy-media.dto';
import { AppRequest } from 'src/common/interfaces/app-request.interface';
import { ProfileStatus, Qualification } from 'src/common/enums';
import { InjectModel } from '@nestjs/mongoose';
import { OnboardingProfileDto } from 'src/modules/profile/dto/onboarding-profile.dto';
import { UserRepository } from 'src/modules/auth/repositories/user.repository';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { MediaService } from './media.service';
import { PreferenceService } from './preference.service';

interface RegisterRequestContext {
  platform: ActivityPlatform;
  ip?: string;
  device?: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileRepo: ProfileRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(PrivacySetting.name)
    private readonly privacySettingModel: Model<PrivacySettingDocument>,
    private readonly notificationService: NotificationService,
    private readonly analyticsService: AnalyticsService,
    private readonly mediaService: MediaService,
    private readonly preferenceService: PreferenceService,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async createProfile(userId: string, dto: CreateProfileDto) {
    try {
      if (await this.profileRepo.exists(userId)) {
        throw new BadRequestException('Profile already exists');
      }

      const payload = this.buildCreatePayload(dto);
      const profile = await this.profileRepo.create(userId, payload);

      return profile;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create profile',
      );
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async getMyProfile(userId: string) {
    try {
      const cacheKey = `profile:${userId}`;
      const cached = await this.cache.get<unknown>(cacheKey);
      if (cached) return cached;

      const profile = await this.profileRepo.findByUserId(userId);
      if (!profile) throw new BadRequestException('Profile not found');

      const enriched = this.enrichProfile(profile as Record<string, unknown>);
      await this.cache.set(cacheKey, enriched, 300);

      return enriched;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve profile',
      );
    }
  }

  // ─── Section updates ──────────────────────────────────────────────────────

  async updatePersonalInfo(req: AppRequest, userId: string, dto: PersonalDto) {
    return this.applyUpdate(
      req,
      userId,
      { personal: dto },
      'profile-personal-update',
    );
  }

  async updatePhysicalInfo(req: AppRequest, userId: string, dto: PhysicalDto) {
    return this.applyUpdate(
      req,
      userId,
      { physical: dto },
      'profile-physical-update',
    );
  }

  async updateEducationInfo(
    req: AppRequest,
    userId: string,
    dto: EducationDto,
  ) {
    return this.applyUpdate(
      req,
      userId,
      { education: dto },
      'profile-education-update',
    );
  }

  async updateFamilyInfo(req: AppRequest, userId: string, dto: FamilyDto) {
    return this.applyUpdate(
      req,
      userId,
      { family: dto },
      'profile-family-update',
    );
  }

  // ─── Privacy Settings ─────────────────────────────────────────────────────

  async getPrivacySettings(userId: string) {
    try {
      const existing = await this.privacySettingModel
        .findOne({ userId })
        .lean();
      if (existing) return existing;

      const created = await this.privacySettingModel.create({
        userId,
        profileVisibility: 'public',
        hideContactDetails: false,
        hidePhotos: false,
        showOnlyToPremium: false,
        allowMessagesFrom: 'all',
        showOnlineStatus: true,
        lastSeenVisibility: 'all',
        incognitoMode: false,
        dailyInterestLimitUsed: 0,
      });
      return created.toObject();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve privacy settings',
      );
    }
  }

  async updatePrivacySettings(
    req: AppRequest,
    userId: string,
    dto: UpdatePrivacySettingsDto,
  ) {
    try {
      const updated = await this.privacySettingModel.findOneAndUpdate(
        { userId },
        { $set: dto },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
      await this.cache.del(`profile:${userId}`);
      void this.fireAnalytics(
        req,
        userId,
        'profile-privacy-update',
        dto as Record<string, unknown>,
      );
      return updated;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update privacy settings',
      );
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async applyUpdate(
    req: AppRequest,
    userId: string,
    dto: UpdateProfileDto,
    source: string,
  ) {
    try {
      const existing = await this.profileRepo.findByUserId(userId);
      if (!existing) throw new BadRequestException('Profile not found');

      const normalized = this.normalizeUpdate(
        dto,
        existing as Record<string, unknown>,
      );
      const result = await this.profileRepo.update(userId, normalized);
      await this.cache.del(`profile:${userId}`);

      const enriched = this.enrichProfile(
        (result as unknown as Record<string, unknown>) ??
          (existing as Record<string, unknown>),
      );

      void this.logActivity(req, userId, source, normalized);
      void this.fireAnalytics(req, userId, source, normalized);

      return enriched;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : `Failed to update profile (${source})`,
      );
    }
  }

  private buildCreatePayload(dto: CreateProfileDto): Record<string, unknown> {
    const birthDate = new Date(dto.personal.dateOfBirth);
    const age = this.calculateAge(birthDate);

    return {
      profileFor: dto.personal.profileFor,
      personal: dto.personal,
      physical: dto.physical,
      education: dto.education,
      family: dto.family ?? {},
      age,
      height: dto.physical.height,
      religion: dto.personal.religion,
      caste: dto.personal.caste,
      city: dto.personal.city,
      gender: dto.personal.gender,
      profileScore: this.calculateProfileScore(dto),
      profileCompletionPercentage: this.calculateCompletion(dto),
      searchTags: this.buildSearchTags(dto),
      status: ProfileStatus.ACTIVE,
      lastActiveAt: new Date(),
    };
  }

  private normalizeUpdate(
    dto: UpdateProfileDto,
    existing: Record<string, unknown>,
  ): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    if (dto.personal) {
      const merged = {
        ...((existing.personal as Record<string, unknown>) ?? {}),
        ...dto.personal,
      };
      normalized.personal = merged;
      // Update derived root fields
      if (dto.personal.dateOfBirth) {
        normalized.age = this.calculateAge(new Date(dto.personal.dateOfBirth));
      }
      if (dto.personal.religion) normalized.religion = dto.personal.religion;
      if (dto.personal.caste) normalized.caste = dto.personal.caste;
      if (dto.personal.city) normalized.city = dto.personal.city;
      if (dto.personal.gender) normalized.gender = dto.personal.gender;
    }

    if (dto.physical) {
      const merged = {
        ...((existing.physical as Record<string, unknown>) ?? {}),
        ...dto.physical,
      };
      normalized.physical = merged;
      if (dto.physical.height) {
        normalized.height = dto.physical.height;
      }
    }

    if (dto.education) {
      normalized.education = {
        ...((existing.education as Record<string, unknown>) ?? {}),
        ...dto.education,
      };
    }

    if (dto.family) {
      normalized.family = {
        ...((existing.family as Record<string, unknown>) ?? {}),
        ...dto.family,
      };
    }

    // Recalculate derived fields from the merged state
    const merged = { ...existing, ...normalized };
    normalized.searchTags = this.buildSearchTagsFromMerged(merged);
    normalized.lastActiveAt = new Date();

    return normalized;
  }

  private enrichProfile(profile: Record<string, unknown>) {
    const personal = (profile.personal ?? {}) as Record<string, unknown>;
    const physical = (profile.physical ?? {}) as Record<string, unknown>;
    const education = (profile.education ?? {}) as Record<string, unknown>;

    return {
      ...profile,
      summary: {
        profileCompletionPercentage: Number(
          profile.profileCompletionPercentage ?? 0,
        ),
        profileScore: Number(profile.profileScore ?? 0),
        hasAboutMe: Boolean(personal.aboutMe),
      },
      sections: {
        personal: {
          completed: Boolean(
            personal.profileFor &&
            personal.firstName &&
            personal.gender &&
            personal.dateOfBirth &&
            personal.religion &&
            personal.maritalStatus,
          ),
        },
        physical: { completed: Boolean(physical.height) },
        education: {
          completed: Boolean(education.qualification && education.occupation),
        },
        family: { completed: Boolean(profile.family) },
      },
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const m = today.getMonth() - dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
      age -= 1;
    }
    return age;
  }

  private heightLabelToCm(label: string): number {
    const match = /(\d+)\s*ft\s*(\d+)\s*in/.exec(label);
    if (!match) return 0;
    const feet = parseInt(match[1], 10);
    const inches = parseInt(match[2], 10);
    return Math.round((feet * 12 + inches) * 2.54);
  }

  private calculateProfileScore(dto: CreateProfileDto): number {
    let score = 60;
    if (dto.personal.aboutMe) score += 10;
    if (dto.education.annualIncomeAmount) score += 10;
    if (dto.family) score += 10;
    return Math.min(score, 100);
  }

  private calculateCompletion(dto: CreateProfileDto): number {
    const checks = [
      Boolean(dto.personal.profileFor),
      Boolean(dto.personal.firstName),
      Boolean(dto.personal.gender),
      Boolean(dto.personal.dateOfBirth),
      Boolean(dto.personal.religion),
      Boolean(dto.personal.maritalStatus),
      Boolean(dto.physical.height),
      Boolean(dto.education.qualification),
      Boolean(dto.education.occupation),
      Boolean(dto.personal.aboutMe),
      Boolean(dto.family),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  private buildSearchTags(dto: CreateProfileDto): string[] {
    const raw = [
      dto.personal.profileFor,
      dto.personal.religion,
      dto.personal.caste,
      dto.personal.city,
      dto.personal.state,
      dto.personal.country,
      dto.personal.motherTongue,
      dto.education.qualification,
      dto.education.occupation,
      ...(dto.personal.languages ?? []),
      ...(dto.personal.hobbies ?? []),
    ];
    return this.deduplicateTags(raw);
  }

  private buildSearchTagsFromMerged(
    profile: Record<string, unknown>,
  ): string[] {
    const personal = (profile.personal ?? {}) as Record<string, unknown>;
    const education = (profile.education ?? {}) as Record<string, unknown>;
    const raw = [
      personal.profileFor,
      personal.religion,
      personal.caste,
      personal.city,
      personal.state,
      personal.country,
      personal.motherTongue,
      education.qualification,
      education.occupation,
      ...(Array.isArray(personal.languages)
        ? (personal.languages as string[])
        : []),
      ...(Array.isArray(personal.hobbies)
        ? (personal.hobbies as string[])
        : []),
    ];

    return this.deduplicateTags(raw as (string | undefined)[]);
  }

  private deduplicateTags(raw: (string | undefined)[]): string[] {
    return Array.from(
      new Set(
        raw
          .filter(
            (v): v is string => typeof v === 'string' && v.trim().length > 0,
          )
          .map((v) => v.trim().toLowerCase()),
      ),
    );
  }

  private async logActivity(
    req: AppRequest,
    userId: string,
    source: string,
    patch: Record<string, unknown>,
  ) {
    await this.activityLogModel.create({
      userId,
      category: ActivityCategory.PROFILE,
      action: ActivityAction.UPDATE_PROFILE,
      ip: req.ip ?? this.getHeader(req, 'x-forwarded-for'),
      device: this.getHeader(req, 'x-device-id'),
      userAgent: this.getHeader(req, 'user-agent'),
      requestId: req.requestId,
      correlationId: req.correlationId,
      platform: this.toActivityPlatform(
        this.getHeader(req, 'x-platform') ?? 'web',
      ),
      metadata: { source, changedFields: Object.keys(patch) },
    });
  }

  private fireAnalytics(
    req: AppRequest,
    userId: string,
    source: string,
    patch: Record<string, unknown>,
  ): void {
    void Promise.allSettled([
      this.notificationService.notify({
        userId,
        title: 'Profile updated',
        message: 'Your profile details were updated successfully.',
        type: 'system',
        category: 'system',
        channels: ['in_app', 'push'],
        metadata: { source, changedFields: Object.keys(patch) },
      }),
      this.analyticsService.trackEvent({
        userId,
        eventType: AnalyticsEventType.PROFILE_UPDATED,
        ipAddress: req.ip ?? this.getHeader(req, 'x-forwarded-for'),
        userAgent: this.getHeader(req, 'user-agent'),
        platform: this.toAnalyticsPlatform(
          this.getHeader(req, 'x-platform') ?? 'web',
        ),
        metadata: { source, changedFields: Object.keys(patch) },
      }),
    ]);
  }

  private getHeader(req: AppRequest, key: string): string | undefined {
    const value = req.headers[key];
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    return undefined;
  }

  private readonly analyticsPlatformMap: Record<string, AnalyticsPlatform> = {
    ios: AnalyticsPlatform.IOS,
    android: AnalyticsPlatform.ANDROID,
  };

  private readonly activityPlatformMap: Record<string, ActivityPlatform> = {
    ios: ActivityPlatform.IOS,
    android: ActivityPlatform.ANDROID,
  };

  private toAnalyticsPlatform(p: string): AnalyticsPlatform {
    return this.analyticsPlatformMap[p?.toLowerCase()] ?? AnalyticsPlatform.WEB;
  }

  private toActivityPlatform(p: string): ActivityPlatform {
    return this.activityPlatformMap[p?.toLowerCase()] ?? ActivityPlatform.WEB;
  }

  private cmToFeetInches(cm: number): {
    feet: number;
    inches: number;
    formatted: string;
  } {
    if (!cm || cm <= 0) {
      return { feet: 0, inches: 0, formatted: '0 ft 0 in' };
    }

    const totalInches = cm / 2.54;

    let feet = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches % 12);

    if (inches === 12) {
      feet += 1;
      inches = 0;
    }

    return {
      feet,
      inches,
      formatted: `${feet} ft ${inches} in`,
    };
  }

  async onboardingProfile(
    req: AuthenticatedRequest,
    userId: string,
    dto: OnboardingProfileDto,
    profileImages: Express.Multer.File[],
  ) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const primaryIndex =
        dto.primaryImageIndex !== undefined
          ? parseInt(String(dto.primaryImageIndex), 10)
          : 0;

      const uploadedImages = await this.mediaService.addImages(
        req,
        userId,
        profileImages,
        primaryIndex,
      );

      await this.createProfile(userId, {
        personal: {
          profileFor: dto.basic.profileFor,
          firstName: dto.basic.firstName,
          lastName: dto.basic.lastName,
          gender: dto.basic.gender,
          dateOfBirth: dto.basic.dateOfBirth,
          religion: dto.basic.religion,
          maritalStatus: dto.basic.maritalStatus,
          country: dto.basic.country,
        },
        physical: {
          height: dto.basic.height,
        },
        education: {
          qualification: dto.basic.qualification as Qualification,
          occupation: dto.basic.occupation,
        },
      });

      await this.preferenceService.createPreference(userId, {
        filters: {
          age: dto.preferences?.ageRange,
          height: dto.preferences?.heightRange,
          maritalStatus: dto.preferences?.maritalStatus,
          religion: dto.preferences?.religion,
          country: dto.preferences?.country,
        },
      });

      user.isOnboardingCompleted = true;
      await user.save();

      await this.activityLogModel.create({
        userId: user._id,
        category: ActivityCategory.PROFILE,
        action: ActivityAction.CREATE_PROFILE,
        ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
        device: this.getHeaderString(req, 'x-device-id'),
        userAgent: this.getHeaderString(req, 'user-agent'),
        requestId: req.requestId,
        correlationId: req.correlationId,
        platform: this.getRegisterRequestContext(req).platform,
        metadata: {
          source: 'onboarding-profile',
          completionPercentage: 100,
          imageCount: uploadedImages.length,
        },
      });

      const channels: Array<'in_app' | 'email' | 'push' | 'sms'> = [
        'in_app',
        'push',
      ];
      if (user.email) {
        channels.push('email');
      }
      if (user.phone?.phone) {
        channels.push('sms');
      }

      await this.notificationService.notify({
        userId: String(user._id),
        title: 'Profile onboarding completed',
        message:
          'Your profile is now live. We will use your onboarding details to improve discovery and matching.',
        type: 'system',
        category: 'system',
        channels,
        metadata: {
          source: 'onboarding-profile',
          isOnboardingCompleted: true,
        },
      });

      await Promise.all([
        this.analyticsService.trackEvent({
          userId,
          eventType: AnalyticsEventType.ONBOARDING_COMPLETED,
          ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
          userAgent: this.getHeaderString(req, 'user-agent'),
          platform: this.toAnalyticsPlatform(
            this.getRegisterRequestContext(req).platform,
          ),
          metadata: {
            source: 'onboarding-profile',
            imageCount: uploadedImages.length,
          },
        }),
        this.analyticsService.trackEvent({
          userId,
          eventType: AnalyticsEventType.PROFILE_CREATED,
          ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
          userAgent: this.getHeaderString(req, 'user-agent'),
          platform: this.toAnalyticsPlatform(
            this.getRegisterRequestContext(req).platform,
          ),
          metadata: {
            source: 'onboarding-profile',
          },
        }),
        this.analyticsService.trackEvent({
          userId,
          eventType: AnalyticsEventType.PROFILE_COMPLETED,
          ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
          userAgent: this.getHeaderString(req, 'user-agent'),
          platform: this.toAnalyticsPlatform(
            this.getRegisterRequestContext(req).platform,
          ),
          metadata: {
            source: 'onboarding-profile',
            completionPercentage: 100,
          },
        }),
      ]);

      return {
        userId: user._id,
        isOnboardingCompleted: user.isOnboardingCompleted,
      };
    } catch (error) {
      console.error('Error in onboardingProfile:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Profile onboarding failed');
    }
  }

  private getRegisterRequestContext(req: AppRequest): RegisterRequestContext {
    const rawPlatform = this.getHeaderString(req, 'x-platform') || 'web';
    return {
      platform: this.toActivityPlatform(rawPlatform),
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device:
        this.getHeaderString(req, 'x-device-id') ||
        this.getHeaderString(req, 'user-agent'),
    };
  }

  private getHeaderString(req: AppRequest, key: string): string | undefined {
    const value = req.headers[key];
    if (typeof value === 'string') {
      return value;
    }

    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'string'
    ) {
      return value[0];
    }

    return undefined;
  }

  private getCookieString(req: AppRequest, key: string): string | undefined {
    const requestObject = req as unknown as Record<string, unknown>;
    const cookies = requestObject['cookies'];
    if (typeof cookies !== 'object' || cookies === null) {
      return undefined;
    }

    const value = (cookies as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
  }
}
