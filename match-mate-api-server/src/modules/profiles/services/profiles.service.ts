import { Injectable, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ProfileRepository } from '../repositories/profile.repository';
import {
  CreateProfileDto,
  PersonalDto,
  PhysicalDto,
  EducationDto,
  FamilyDto,
} from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import type { ICacheService } from '@/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/modules/cache/interfaces/cache.interface';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { AppLogger } from '@/common/logger/logger.service';
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
import { AppRequest } from '@/common/interfaces/app-request.interface';
import { ProfileStatus, Qualification } from '@/common/enums';
import { InjectModel } from '@nestjs/mongoose';
import { OnboardingProfileDto } from '@/modules/profiles/dto/onboarding-profile.dto';
import { UserRepository } from '@/modules/auth/repositories/user.repository';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { MediaService } from './media.service';
import { PreferenceService } from './preference.service';
import { UpdateProfileLocationDto } from '../dto/location.dto';
import { SettingsService } from '@/modules/settings/services/settings.service';
import {
  Verification,
  VerificationDocument,
} from '../../safety/schemas/verification.schema';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwNotFound,
  throwUnauthorized,
} from '@/common/exceptions/throw-app-exception';
import { AppException } from '@/common/exceptions/app.exception';

interface RegisterRequestContext {
  platform: ActivityPlatform;
  ip?: string;
  device?: string;
}

interface ApplyUpdateOptions {
  notifyUser?: boolean;
  trackProfileUpdatedAnalytics?: boolean;
}

@Injectable()
export class ProfilesService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileRepo: ProfileRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly analyticsService: AnalyticsService,
    private readonly mediaService: MediaService,
    private readonly preferenceService: PreferenceService,
    private readonly settingsService: SettingsService,
    private readonly logger: AppLogger,
  ) {}

  //  Create

  async createProfile(userId: string, dto: CreateProfileDto) {
    try {
      if (await this.profileRepo.exists(userId)) {
        return throwBadRequest(ErrorCode.INVALID_REQUEST, {
          reason: 'profile_already_exists',
        });
      }

      const payload = this.buildCreatePayload(dto);
      const profile = await this.profileRepo.create(userId, payload);

      return profile;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_create_profile',
      });
    }
  }

  //  Read

  async getMyProfile(userId: string) {
    try {
      const cacheKey = `profile:${userId}`;
      const cached = await this.cache.get<unknown>(cacheKey);
      if (cached) return cached;

      const profile = await this.profileRepo.findByUserId(userId);
      if (!profile) return throwNotFound(ErrorCode.PROFILE_NOT_FOUND);

      const enriched = await this.withVerificationStatus(
        userId,
        this.enrichProfile(profile as Record<string, unknown>),
      );
      await this.cache.set(cacheKey, enriched, 300);

      return enriched;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_retrieve_profile',
      });
    }
  }

  //  Section updates

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

  async updateLocation(
    req: AppRequest,
    userId: string,
    dto: UpdateProfileLocationDto,
  ) {
    return this.applyUpdate(
      req,
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [dto.longitude, dto.latitude],
        },
        lastActiveAt: new Date(),
      },
      'profile-location-update',
      {
        notifyUser: false,
        trackProfileUpdatedAnalytics: false,
      },
    );
  }

  //  Private helpers

  private async applyUpdate(
    req: AppRequest,
    userId: string,
    dto: Partial<UpdateProfileDto> & Record<string, unknown>,
    source: string,
    options: ApplyUpdateOptions = {},
  ) {
    try {
      const existing = await this.profileRepo.findByUserId(userId);
      if (!existing) return throwNotFound(ErrorCode.PROFILE_NOT_FOUND);

      const normalized = this.normalizeUpdate(
        dto,
        existing as unknown as Record<string, unknown>,
      );
      const changedFields = this.getChangedProfileFields(
        existing as unknown as Record<string, unknown>,
        normalized,
      );

      if (changedFields.length === 0) {
        return this.withVerificationStatus(
          userId,
          this.enrichProfile(existing as unknown as Record<string, unknown>),
        );
      }

      const result = await this.profileRepo.update(userId, normalized);
      await this.cache.del(`profile:${userId}`);

      const enriched = await this.withVerificationStatus(
        userId,
        this.enrichProfile(
          ((result?.toObject?.() ?? result) as unknown as Record<
            string,
            unknown
          >) ?? (existing as unknown as Record<string, unknown>),
        ),
      );

      void this.logActivity(req, userId, source, normalized, changedFields);
      void this.fireAnalytics(req, userId, source, changedFields, {
        notifyUser: options.notifyUser ?? true,
        trackProfileUpdatedAnalytics:
          options.trackProfileUpdatedAnalytics ?? true,
      });

      return enriched;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_update_profile',
        source,
      });
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
      profileScore: this.calculateProfileScore(dto),
      profileCompletionPercentage: this.calculateCompletion(dto),
      searchTags: this.buildSearchTags(dto),
      status: ProfileStatus.ACTIVE,
      lastActiveAt: new Date(),
    };
  }

  private normalizeUpdate(
    dto: Partial<UpdateProfileDto> & Record<string, unknown>,
    existing: Record<string, unknown>,
  ): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    if (dto.personal) {
      const merged = {
        ...((existing.personal as Record<string, unknown>) ?? {}),
        ...dto.personal,
      };
      normalized.personal = merged;
      if (dto.personal.dateOfBirth) {
        normalized.age = this.calculateAge(new Date(dto.personal.dateOfBirth));
      }
    }

    if (dto.physical) {
      const merged = {
        ...((existing.physical as Record<string, unknown>) ?? {}),
        ...dto.physical,
      };
      normalized.physical = merged;
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

    if (dto.location) {
      normalized.location = dto.location;
    }

    // Recalculate derived fields from the merged state
    const merged = { ...existing, ...normalized };
    normalized.searchTags = this.buildSearchTagsFromMerged(merged);
    normalized.profileCompletionPercentage =
      this.calculateCompletionFromMerged(merged);
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

  private async withVerificationStatus(
    userId: string,
    profile: Record<string, unknown>,
  ) {
    const user = await this.userRepo.findById(userId);
    const verification = await this.verificationModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
            isEmailVerified: Boolean(user?.isEmailVerified),
            isPhoneVerified: Boolean(user?.isPhoneVerified),
            isProfileVerified: Boolean(profile.isVerified),
            isVerified: Boolean(profile.isVerified),
            verifiedAt: profile.isVerified ? new Date() : undefined,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();

    const isProfileVerified = Boolean(
      verification?.isProfileVerified ?? profile.isVerified,
    );

    if (Boolean(profile.isVerified) !== isProfileVerified) {
      await this.profileRepo.update(userId, { isVerified: isProfileVerified });
    }

    return {
      ...profile,
      isVerified: isProfileVerified,
      verification: {
        isVerified: isProfileVerified,
        isProfileVerified,
        isEmailVerified: Boolean(
          verification?.isEmailVerified ?? user?.isEmailVerified,
        ),
        isPhoneVerified: Boolean(
          verification?.isPhoneVerified ?? user?.isPhoneVerified,
        ),
        verifiedAt: verification?.verifiedAt,
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

  private calculateCompletionFromMerged(
    profile: Record<string, unknown>,
  ): number {
    const personal = (profile.personal ?? {}) as Record<string, unknown>;
    const physical = (profile.physical ?? {}) as Record<string, unknown>;
    const education = (profile.education ?? {}) as Record<string, unknown>;

    const checks = [
      Boolean(personal.profileFor),
      Boolean(personal.firstName),
      Boolean(personal.gender),
      Boolean(personal.dateOfBirth),
      Boolean(personal.religion),
      Boolean(personal.maritalStatus),
      Boolean(physical.height),
      Boolean(education.qualification),
      Boolean(education.occupation),
      Boolean(personal.aboutMe),
      Boolean(profile.family),
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
    changedFields = Object.keys(patch),
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
      metadata: { source, changedFields },
    });
  }

  private fireAnalytics(
    req: AppRequest,
    userId: string,
    source: string,
    changedFields: string[],
    options: Required<ApplyUpdateOptions> = {
      notifyUser: true,
      trackProfileUpdatedAnalytics: true,
    },
  ): void {
    const tasks: Array<Promise<unknown>> = [];

    if (options.notifyUser) {
      tasks.push(
        this.notificationsService.notify({
          userId,
          title: 'Profile updated',
          message: 'Your profile details were updated successfully.',
          type: 'system',
          category: 'system',
          channels: ['in_app', 'push'],
          metadata: { source, changedFields },
        }),
      );
    }

    if (options.trackProfileUpdatedAnalytics) {
      tasks.push(
        this.analyticsService.trackEvent({
          userId,
          eventType: AnalyticsEventType.PROFILE_UPDATED,
          ipAddress: req.ip ?? this.getHeader(req, 'x-forwarded-for'),
          userAgent: this.getHeader(req, 'user-agent'),
          platform: this.toAnalyticsPlatform(
            this.getHeader(req, 'x-platform') ?? 'web',
          ),
          metadata: { source, changedFields },
        }),
      );
    }

    void Promise.allSettled(tasks);
  }

  private getChangedProfileFields(
    existing: Record<string, unknown>,
    normalized: Record<string, unknown>,
  ): string[] {
    return Object.keys(normalized).filter((field) => {
      if (this.isDerivedProfileField(field)) {
        return false;
      }

      return !this.areProfileValuesEqual(existing[field], normalized[field]);
    });
  }

  private isDerivedProfileField(field: string): boolean {
    return [
      'lastActiveAt',
      'profileCompletionPercentage',
      'profileScore',
      'searchTags',
    ].includes(field);
  }

  private areProfileValuesEqual(left: unknown, right: unknown): boolean {
    return this.stableProfileValue(left) === this.stableProfileValue(right);
  }

  private stableProfileValue(value: unknown): string {
    return JSON.stringify(this.normalizeProfileValue(value));
  }

  private normalizeProfileValue(value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeProfileValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = this.normalizeProfileValue(
            (value as Record<string, unknown>)[key],
          );
          return acc;
        }, {});
    }

    return value;
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
        return throwUnauthorized(ErrorCode.AUTH_USER_NOT_FOUND);
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
      await this.settingsService.getOrCreateAllUserSettings(userId);

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

      await this.notificationsService.notify({
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
      this.logger.error(
        'Profile onboarding failed',
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof AppException) {
        throw error;
      }
      return throwUnauthorized(ErrorCode.INVALID_REQUEST, {
        reason: 'profile_onboarding_failed',
      });
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
