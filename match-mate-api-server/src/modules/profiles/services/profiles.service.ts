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
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { AnalyticsService } from '@/modules/analytics/services/analytics.service';
import { AppLogger } from '@/common/logger/logger.service';
import {
  AnalyticsEventType,
  AnalyticsPlatform,
} from '@/modules/analytics/enums/analytics-event.enum';
import {
  ActivityLog,
  ActivityLogDocument,
} from '../schemas/settings/activity-logs.schema';
import {
  ActivityAction,
  ActivityCategory,
  ActivityPlatform,
} from '../enums/activity-log.enums';
import { AppRequest } from '@/common/interfaces/app-request.interface';
import { PersonalityBadge, ProfileStatus, Qualification } from '@/common/enums';
import { InjectModel } from '@nestjs/mongoose';
import { OnboardingProfileDto } from '@/modules/profiles/dto/onboarding-profile.dto';
import { UserRepository } from '@/modules/auth/repositories/user.repository';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { MediaService } from './media.service';
import { PreferenceService } from './preference.service';
import { ProfileScoringService } from './profile-scoring.service';
import { UpdateProfileLocationDto } from '../dto/location.dto';
import { SettingsService } from '@/modules/settings/services/settings.service';
import {
  Verification,
  VerificationDocument,
} from '@/modules/safety/schemas/verification.schema';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwNotFound,
  throwUnauthorized,
} from '@/common/exceptions/throw-app-exception';
import { AppException } from '@/common/exceptions/app.exception';
import { normalizeFamilySiblings } from '../utils/family-normalization.util';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';

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
  private readonly defaultPersonalityBadges = [
    PersonalityBadge.FAMILY_ORIENTED,
    PersonalityBadge.MARRIAGE_FOCUSED,
    PersonalityBadge.FRIENDLY,
  ];

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
    private readonly profileScoringService: ProfileScoringService,
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

  private async saveOnboardingProfile(userId: string, dto: CreateProfileDto) {
    const payload = this.buildCreatePayload(dto);

    if (await this.profileRepo.exists(userId)) {
      const profile = await this.profileRepo.update(userId, payload);
      await this.cache.del(`profile:${userId}`);
      return profile;
    }

    return this.profileRepo.create(userId, payload);
  }

  //  Read

  async getMyProfile(userId: string) {
    try {
      const cacheKey = `profile:${userId}`;
      const cached = await this.cache.get<unknown>(cacheKey);
      if (cached) return cached;

      const profile = await this.profileRepo.findByUserId(userId);
      if (!profile) return throwNotFound(ErrorCode.PROFILE_NOT_FOUND);
      const normalizedProfile = await this.ensureDefaultPersonalityBadges(
        userId,
        profile,
      );

      const [images, videos] = await Promise.all([
        this.mediaService.getImages(userId),
        this.mediaService.getVideos(userId),
      ]);

      const enriched = await this.withVerificationStatus(
        userId,
        this.enrichProfile({
          ...normalizedProfile,
          images,
          videoIntro:
            videos.find((video) => video.isPrimary) ?? videos[0] ?? null,
        }),
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
      { notifyUser: false },
    );
  }

  async updatePhysicalInfo(req: AppRequest, userId: string, dto: PhysicalDto) {
    return this.applyUpdate(
      req,
      userId,
      { physical: dto },
      'profile-physical-update',
      { notifyUser: false },
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
      { notifyUser: false },
    );
  }

  async updateFamilyInfo(req: AppRequest, userId: string, dto: FamilyDto) {
    return this.applyUpdate(
      req,
      userId,
      { family: normalizeFamilySiblings(dto) },
      'profile-family-update',
      { notifyUser: false },
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

      this.assertImmutableIdentityFields(dto, existing);

      const normalized = this.normalizeUpdate(dto, existing);
      const changedFields = this.getChangedProfileFields(existing, normalized);

      if (changedFields.length === 0) {
        return this.withVerificationStatus(
          userId,
          this.enrichProfile(existing),
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
          >) ?? existing,
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
    const age = this.requireAdultAge(birthDate);
    const family = normalizeFamilySiblings(dto.family);
    const { missingFields: _missingFields, ...derived } =
      this.profileScoringService.calculate({
        personal: dto.personal as unknown as Record<string, unknown>,
        physical: dto.physical as unknown as Record<string, unknown>,
        education: dto.education as unknown as Record<string, unknown>,
        family: family as unknown as Record<string, unknown> | undefined,
      });
    void _missingFields;

    return {
      profileFor: dto.personal.profileFor,
      personal: {
        ...dto.personal,
        personalityBadges: this.resolvePersonalityBadges(
          dto.personal.personalityBadges,
        ),
      },
      physical: dto.physical,
      education: dto.education,
      family: family ?? {},
      age,
      ...derived,
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
      merged.personalityBadges = this.resolvePersonalityBadges(
        Array.isArray(merged.personalityBadges)
          ? merged.personalityBadges
          : undefined,
      );
      normalized.personal = merged;
      if (dto.personal.dateOfBirth) {
        normalized.age = this.requireAdultAge(
          new Date(dto.personal.dateOfBirth),
        );
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
        ...(existing.education ?? {}),
        ...dto.education,
      };
    }

    if (dto.family) {
      normalized.family = normalizeFamilySiblings({
        ...((existing.family as Record<string, unknown>) ?? {}),
        ...dto.family,
      });
    }

    if (dto.location) {
      normalized.location = dto.location;
    }

    // Recalculate derived fields from the merged state
    const merged = { ...existing, ...normalized };
    const { missingFields: _missingFields, ...derived } =
      this.profileScoringService.calculate(
        merged,
        this.getMediaSummaryFromProfile(merged),
      );
    void _missingFields;
    normalized.searchTags = this.buildSearchTagsFromMerged(merged);
    normalized.profileCompletionPercentage =
      derived.profileCompletionPercentage;
    normalized.profileScore = derived.profileScore;
    normalized.visibilityScore = derived.visibilityScore;
    normalized.lastActiveAt = new Date();

    return normalized;
  }

  private assertImmutableIdentityFields(
    dto: Partial<UpdateProfileDto> & Record<string, unknown>,
    existing: Record<string, unknown>,
  ): void {
    if (!dto.personal) return;

    const incoming = dto.personal;
    const current = (existing.personal ?? {}) as Record<string, unknown>;
    const lockedFields: Array<keyof PersonalDto> = [
      'profileFor',
      'gender',
      'dateOfBirth',
    ];
    const changed = lockedFields.filter((field) => {
      if (incoming[field] === undefined) return false;
      const incomingValue = incoming[field];
      const currentValue = current[field];
      const next =
        typeof incomingValue === 'string'
          ? incomingValue.slice(0, 10).toLowerCase()
          : '';
      const previous =
        typeof currentValue === 'string'
          ? currentValue.slice(0, 10).toLowerCase()
          : '';
      return Boolean(previous) && next !== previous;
    });

    if (changed.length) {
      throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'immutable_identity_fields',
        fields: changed,
        supportRequired: true,
      });
    }
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
        visibilityScore: Number(profile.visibilityScore ?? 0),
        missingFields: Array.isArray(profile.missingFields)
          ? profile.missingFields
          : [],
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
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();

    return {
      ...profile,
      verification: {
        status: verification?.status ?? VerificationStatus.NOT_STARTED,
        provider: verification?.provider,
        verifiedAt: verification?.verifiedAt,
      },
      accountVerification: {
        emailVerified: Boolean(user?.isEmailVerified),
        phoneVerified: Boolean(user?.isPhoneVerified),
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

  private requireAdultAge(dateOfBirth: Date): number {
    const age = this.calculateAge(dateOfBirth);
    if (!Number.isFinite(age) || age < 18) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'minimum_age_required',
        minimumAge: 18,
      });
    }
    return age;
  }

  async refreshDerivedScores(userId: string) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) return null;

    const [images, videos, verification] = await Promise.all([
      this.mediaService.getImages(userId),
      this.mediaService.getVideos(userId),
      this.verificationModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .select('status')
        .lean()
        .exec(),
    ]);
    const { missingFields: _missingFields, ...derived } =
      this.profileScoringService.calculate(
        {
          ...(profile as Record<string, unknown>),
          verificationStatus:
            verification?.status ?? VerificationStatus.NOT_STARTED,
        },
        {
          imageCount: Array.isArray(images) ? images.length : 0,
          videoCount: Array.isArray(videos) ? videos.length : 0,
        },
      );
    void _missingFields;

    const updated = await this.profileRepo.update(userId, derived);
    await this.cache.del(`profile:${userId}`);
    return updated;
  }

  async archiveInactiveProfiles(inactiveDays: number, limit: number) {
    if (inactiveDays <= 0) {
      return { matchedCount: 0, modifiedCount: 0, skipped: true };
    }

    const cutoff = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);
    const result = await this.profileRepo.archiveInactive(cutoff, limit);

    return {
      ...result,
      skipped: false,
      cutoff,
      inactiveDays,
    };
  }

  private getMediaSummaryFromProfile(profile: Record<string, unknown>) {
    const images = profile.images;
    const videoIntro = profile.videoIntro;
    return {
      imageCount: Array.isArray(images) ? images.length : undefined,
      videoCount: videoIntro ? 1 : undefined,
    };
  }

  private buildSearchTags(dto: CreateProfileDto): string[] {
    const raw = [
      dto.personal.profileFor,
      dto.personal.religion,
      dto.personal.religiousDetails?.caste,
      dto.personal.city,
      dto.personal.state,
      dto.personal.country,
      dto.personal.isNri ? 'nri' : undefined,
      dto.personal.residencyCountry,
      dto.personal.visaStatus,
      dto.personal.motherTongue,
      dto.education.qualification,
      dto.education.occupation,
      ...(dto.personal.languages ?? []),
      ...(dto.personal.hobbies ?? []),
      ...(dto.personal.personalityBadges ?? []),
    ];
    return this.deduplicateTags(raw);
  }

  private buildSearchTagsFromMerged(
    profile: Record<string, unknown>,
  ): string[] {
    const personal = (profile.personal ?? {}) as Record<string, unknown>;
    const religiousDetails =
      (personal.religiousDetails as Record<string, unknown> | undefined) ?? {};
    const education = (profile.education ?? {}) as Record<string, unknown>;
    const raw = [
      personal.profileFor,
      personal.religion,
      religiousDetails.caste,
      personal.city,
      personal.state,
      personal.country,
      personal.isNri ? 'nri' : undefined,
      personal.residencyCountry,
      personal.visaStatus,
      personal.motherTongue,
      education.qualification,
      education.occupation,
      ...(Array.isArray(personal.languages)
        ? (personal.languages as string[])
        : []),
      ...(Array.isArray(personal.hobbies)
        ? (personal.hobbies as string[])
        : []),
      ...(Array.isArray(personal.personalityBadges)
        ? (personal.personalityBadges as string[])
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
          dedupeKey: `profile-updated:${userId}:${source}`,
          metadata: { source, changedFields, dedupeWindowSeconds: 60 },
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
      'visibilityScore',
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
      return Object.keys(value)
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

      const existingImages = await this.mediaService.getImages(userId);
      const uploadedImages =
        existingImages.length === 0 && profileImages.length > 0
          ? await this.mediaService.addImages(
              req,
              userId,
              profileImages,
              primaryIndex,
            )
          : [];

      const profilePayload = {
        personal: {
          profileFor: dto.basic.profileFor,
          firstName: dto.basic.firstName,
          lastName: dto.basic.lastName,
          gender: dto.basic.gender,
          dateOfBirth: dto.basic.dateOfBirth,
          religion: dto.basic.religion,
          maritalStatus: dto.basic.maritalStatus,
          country: dto.basic.country,
          state: dto.basic.state,
          city: dto.basic.city,
          personalityBadges: this.defaultPersonalityBadges,
        },
        physical: {
          height: dto.basic.height,
        },
        education: {
          qualification: dto.basic.qualification as Qualification,
          occupation: dto.basic.occupation,
        },
      } as CreateProfileDto & Record<string, unknown>;

      await this.saveOnboardingProfile(userId, profilePayload);

      await this.preferenceService.upsertPreference(userId, {
        filters: {
          age: dto.preferences?.ageRange,
          height: dto.preferences?.heightRange,
          maritalStatus: dto.preferences?.maritalStatus,
          religion: dto.preferences?.religion,
          caste: dto.preferences?.caste,
          subCaste: dto.preferences?.subCaste,
          manglikStatus: dto.preferences?.manglikStatus,
          country: dto.preferences?.country,
          state: dto.preferences?.state,
          city: dto.preferences?.city,
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
        emailBody: this.buildOnboardingCompletedEmail({
          userName: this.getProfileDisplayName(dto.basic.firstName, user.email),
        }),
        type: 'system',
        category: 'system',
        priority: 'critical',
        channels,
        dedupeKey: `profile-onboarding-completed:${String(user._id)}`,
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

  private resolvePersonalityBadges(
    badges?: Array<PersonalityBadge | string>,
  ): PersonalityBadge[] {
    if (Array.isArray(badges) && badges.length >= 3) {
      return badges.slice(0, 10) as PersonalityBadge[];
    }

    return [...this.defaultPersonalityBadges];
  }

  private async ensureDefaultPersonalityBadges(
    userId: string,
    profile: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const personal = (profile.personal ?? {}) as Record<string, unknown>;
    const currentBadges = personal.personalityBadges;

    if (Array.isArray(currentBadges) && currentBadges.length >= 3) {
      return profile;
    }

    const personalWithDefaults = {
      ...personal,
      personalityBadges: this.defaultPersonalityBadges,
    };
    await this.profileRepo.update(userId, { personal: personalWithDefaults });
    await this.cache.del(`profile:${userId}`);

    return {
      ...profile,
      personal: personalWithDefaults,
    };
  }

  private buildOnboardingCompletedEmail(params: { userName: string }): string {
    const safeName = this.escapeHtml(params.userName);

    return `
      <div style="margin:0;padding:0;background:#fff5f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
          <div style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #f7d5df;box-shadow:0 16px 40px rgba(124,45,70,0.10);">
            <div style="padding:28px 30px;background:linear-gradient(135deg,#ff7a9e,#b83280);color:#ffffff;">
              <div style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Profile live</div>
              <h1 style="margin:10px 0 0;font-size:28px;line-height:1.25;">Your Match Mate profile is ready</h1>
            </div>
            <div style="padding:30px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">Namaste ${safeName},</p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.65;">Your onboarding is complete and your matrimonial profile is now live. We will use your profile and partner preferences to improve discovery and recommendations.</p>
              <div style="padding:18px;border-radius:18px;background:#fff5f8;border:1px solid #f7d5df;margin:22px 0;">
                <div style="font-size:14px;font-weight:700;margin-bottom:10px;color:#9d174d;">What to do next</div>
                <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#374151;">
                  <li>Complete family, career, lifestyle and about-me sections.</li>
                  <li>Add verification details to improve trust with families.</li>
                  <li>Open recommended matches and shortlist profiles you like.</li>
                </ol>
              </div>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#4b5563;">You can update privacy, notifications and account security anytime from Settings.</p>
              <p style="margin:0;font-size:14px;line-height:1.65;color:#6b7280;">Best wishes,<br/>Team Match Mate</p>
            </div>
          </div>
          <p style="margin:18px 8px 0;text-align:center;font-size:12px;line-height:1.5;color:#9ca3af;">This message confirms that onboarding for your Match Mate account was completed.</p>
        </div>
      </div>
    `;
  }

  private getProfileDisplayName(firstName?: string, email?: string): string {
    const trimmedName = firstName?.trim();
    if (trimmedName) {
      return trimmedName;
    }

    const emailName = email
      ?.split('@')[0]
      ?.replace(/[._-]+/g, ' ')
      .trim();
    return emailName || 'there';
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
}
