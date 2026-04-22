import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProfileRepository } from '../repositories/profile.repository';
import {
  CreateProfileDto,
  EducationDto,
  FamilyDto,
  PersonalDto,
  PhysicalDto,
  PreferencesDto,
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
import { AppRequest } from 'src/common/interfaces/app-request.interface';
import { StorageService } from '../../storage/services/storage.service';
import {
  PrivacySetting,
  PrivacySettingDocument,
} from '../schemas/settings/privacy-setting.schema';
import { UpdatePrivacySettingsDto } from '../dto/privacy-media.dto';
import { BodyType, Complexion, ProfileStatus, Religion } from 'src/common/enums';

// ─── Image type ───────────────────────────────────────────────────────────────

export interface ProfileImageInput {
  url: string;
  isPrimary: boolean;
  filename?: string;
}

type ProfileCreationInput = Omit<CreateProfileDto, 'family'> & {
  family?: FamilyDto;
};

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(PrivacySetting.name)
    private readonly privacySettingModel: Model<PrivacySettingDocument>,
    private readonly notificationService: NotificationService,
    private readonly analyticsService: AnalyticsService,
    private readonly storageService: StorageService,
  ) {}

  async createProfile(
    userId: string,
    dto: ProfileCreationInput,
    profileImages: ProfileImageInput[] = [],
  ) {
    try {
      const existing = await this.profileRepo.findByUserId(userId);
      if (existing) {
        throw new BadRequestException('Profile already exists');
      }

      const imageDocuments = profileImages.map((img) => ({
        ...img,
        isActive: true,
        uploadedAt: new Date(),
      }));

      const normalizedPayload = this.normalizeProfilePayload(
        dto,
        imageDocuments,
      );

      return await this.profileRepo.createProfile(
        userId,
        normalizedPayload,
        imageDocuments,
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create profile',
      );
    }
  }

  async updateProfile(req: AppRequest, userId: string, dto: UpdateProfileDto) {
    try {
      return await this.applyProfileUpdate(req, userId, dto, 'profile-update');
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    }
  }

  async updatePersonalInfo(req: AppRequest, userId: string, dto: PersonalDto) {
    try {
      return await this.applyProfileUpdate(
        req,
        userId,
        { personal: dto },
        'profile-personal-update',
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update personal info',
      );
    }
  }

  async updatePhysicalInfo(req: AppRequest, userId: string, dto: PhysicalDto) {
    try {
      return await this.applyProfileUpdate(
        req,
        userId,
        { physical: dto },
        'profile-physical-update',
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update physical info',
      );
    }
  }

  async updateEducationInfo(
    req: AppRequest,
    userId: string,
    dto: EducationDto,
  ) {
    try {
      return await this.applyProfileUpdate(
        req,
        userId,
        { education: dto },
        'profile-education-update',
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update education info',
      );
    }
  }

  async updateFamilyInfo(req: AppRequest, userId: string, dto: FamilyDto) {
    try {
      return await this.applyProfileUpdate(
        req,
        userId,
        { family: dto },
        'profile-family-update',
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update family info',
      );
    }
  }

  async updatePreferences(
    req: AppRequest,
    userId: string,
    dto: PreferencesDto,
  ) {
    try {
      return await this.applyProfileUpdate(
        req,
        userId,
        { preferences: dto },
        'profile-preferences-update',
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update preferences',
      );
    }
  }

  // ─── Image Methods ──────────────────────────────────────────────────────────

  async addImages(
    req: AppRequest,
    userId: string,
    profileImages: Express.Multer.File[],
  ) {
    try {
      const uploadedImages = await this.storageService.uploadFiles(
        profileImages,
        'profiles',
      );
      const existingImages = await this.profileRepo.getImages(userId);
      const shouldSetPrimary = existingImages.length === 0;
      const imageDocuments = uploadedImages.map((img, index) => ({
        ...img,
        isPrimary: shouldSetPrimary && index === 0,
        uploadedAt: new Date(),
        isActive: true,
      }));

      const result = await this.profileRepo.addImages(userId, imageDocuments);
      await this.cache.del(`profile:${userId}`);
      await this.logProfileActivity(req, userId, 'profile-image-upload', {
        profileImages: imageDocuments,
      });
      this.triggerProfileUpdateJobs(req, userId, 'profile-image-upload', {
        uploadedImageCount: imageDocuments.length,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to add profile images',
      );
    }
  }

  async setPrimaryImage(req: AppRequest, userId: string, imageId: string) {
    try {
      const result = await this.profileRepo.setPrimaryImage(userId, imageId);
      await this.cache.del(`profile:${userId}`);
      await this.logProfileActivity(req, userId, 'profile-image-primary', {
        imageId,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to set primary image',
      );
    }
  }

  async removeImage(req: AppRequest, userId: string, imageId: string) {
    try {
      const existingImages = await this.profileRepo.getImages(userId);
      const imageToRemove = existingImages.find(
        (image) =>
          typeof image === 'object' &&
          image !== null &&
          '_id' in image &&
          String((image as { _id: unknown })._id) === imageId,
      ) as { filename?: string } | undefined;

      const result = await this.profileRepo.removeImage(userId, imageId);
      if (imageToRemove?.filename) {
        await this.storageService.deleteFile(
          imageToRemove.filename,
          'profiles',
        );
      }
      await this.cache.del(`profile:${userId}`);
      await this.logProfileActivity(req, userId, 'profile-image-delete', {
        imageId,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to remove image',
      );
    }
  }

  async getImages(userId: string) {
    try {
      return await this.profileRepo.getImages(userId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve images',
      );
    }
  }

  async addVideos(
    req: AppRequest,
    userId: string,
    profileVideos: Express.Multer.File[],
  ) {
    try {
      const uploadedVideos = await this.storageService.uploadFiles(
        profileVideos,
        'profile-videos',
      );
      const existingVideos = await this.profileRepo.getVideos(userId);
      const shouldSetPrimary = existingVideos.length === 0;
      const videoDocuments = uploadedVideos.map((video, index) => ({
        ...video,
        isPrimary: shouldSetPrimary && index === 0,
        isActive: true,
        uploadedAt: new Date(),
        mimeType: profileVideos[index]?.mimetype,
        size: profileVideos[index]?.size,
      }));

      const result = await this.profileRepo.addVideos(userId, videoDocuments);
      await this.cache.del(`profile:${userId}`);
      await this.logProfileActivity(req, userId, 'profile-video-upload', {
        profileVideos: videoDocuments,
      });
      this.triggerProfileUpdateJobs(req, userId, 'profile-video-upload', {
        uploadedVideoCount: videoDocuments.length,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to add profile videos',
      );
    }
  }

  async getVideos(userId: string) {
    try {
      return await this.profileRepo.getVideos(userId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve videos',
      );
    }
  }

  async setPrimaryVideo(req: AppRequest, userId: string, videoId: string) {
    try {
      const result = await this.profileRepo.setPrimaryVideo(userId, videoId);
      await this.cache.del(`profile:${userId}`);
      await this.logProfileActivity(req, userId, 'profile-video-primary', {
        videoId,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to set primary video',
      );
    }
  }

  async removeVideo(req: AppRequest, userId: string, videoId: string) {
    try {
      const existingVideos = await this.profileRepo.getVideos(userId);
      const videoToRemove = existingVideos.find(
        (video) =>
          typeof video === 'object' &&
          video !== null &&
          '_id' in video &&
          String((video as { _id: unknown })._id) === videoId,
      ) as { filename?: string } | undefined;

      const result = await this.profileRepo.removeVideo(userId, videoId);
      if (videoToRemove?.filename) {
        await this.storageService.deleteFile(
          videoToRemove.filename,
          'profile-videos',
        );
      }
      await this.cache.del(`profile:${userId}`);
      await this.logProfileActivity(req, userId, 'profile-video-delete', {
        videoId,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to remove video',
      );
    }
  }

  async getPrivacySettings(userId: string) {
    try {
      const existingSettings = await this.privacySettingModel
        .findOne({ userId })
        .lean();

      if (existingSettings) {
        return existingSettings;
      }

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

      await this.profileRepo.updateProfile(userId, {
        ...(dto.hideContactDetails !== undefined
          ? { hideContactDetails: dto.hideContactDetails }
          : {}),
        ...(dto.hidePhotos !== undefined ? { hidePhotos: dto.hidePhotos } : {}),
        ...(dto.showOnlyToPremium !== undefined
          ? { showOnlyToPaidUsers: dto.showOnlyToPremium }
          : {}),
      } as UpdateProfileDto);
      await this.cache.del(`profile:${userId}`);

      await this.logProfileActivity(
        req,
        userId,
        'profile-privacy-update',
        dto as Record<string, unknown>,
      );
      this.triggerProfileUpdateJobs(
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

  async getMyProfile(userId: string): Promise<unknown> {
    try {
      const cacheKey = `profile:${userId}`;

      // Try cache first
      const cached = await this.cache.get<unknown>(cacheKey);
      if (cached) return cached;

      // Fetch from DB
      const profile = await this.profileRepo.findByUserId(userId);
      if (!profile) {
        throw new BadRequestException('Profile not found');
      }

      const enrichedProfile = this.enrichProfileResponse(
        profile as unknown as Record<string, unknown>,
      );

      // Cache for 5 minutes
      await this.cache.set(cacheKey, enrichedProfile, 300);

      return enrichedProfile;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve profile',
      );
    }
  }

  private normalizeProfilePayload(
    dto: ProfileCreationInput,
    profileImages: Array<{
      url: string;
      isPrimary: boolean;
      isActive: boolean;
      uploadedAt: Date;
    }>,
  ): Record<string, unknown> {
    const birthDate = new Date(dto.personal.dateOfBirth);
    const age = this.calculateAge(birthDate);
    const annualIncome = dto.education.annualIncome
      ? Number(dto.education.annualIncome)
      : undefined;

    return {
      profileFor: dto.personal.profileFor,
      personal: {
        ...dto.personal,
        dateOfBirth: birthDate,
        age,
      },
      physical: {
        heightLabel: this.cmToFeetInches(dto.physical.height).formatted,
        weight: dto.physical.weight,
        bodyType: dto.physical.bodyType,
        complexion: dto.physical.complexion,
      },
      education: {
        qualification: dto.education.qualification,
        field: dto.education.field,
        university: dto.education.university,
        occupation: dto.education.occupation,
        annualIncome: Number.isFinite(annualIncome) ? annualIncome : undefined,
      },
      family: dto.family ?? {},
      age: age,
      heightCm: dto.physical.height,
      religion: dto.personal.religion,
      caste: dto.personal.caste,
      city: dto.personal.city,
      gender: dto.personal.gender,
      profileScore: this.calculateProfileScore(dto, profileImages.length),
      profileCompletionPercentage: 100,
      searchTags: this.buildSearchTags(dto),
      membershipPlan: 'free',
      status: ProfileStatus.ACTIVE,
      lastActiveAt: new Date(),
      isDeleted: false,
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age -= 1;
    }
    return age;
  }

  private calculateProfileScore(
    dto: ProfileCreationInput,
    imageCount: number,
  ): number {
    let score = 60;
    if (dto.personal.aboutMe) score += 10;
    if (dto.preferences) score += 10;
    if (dto.preferences?.qualification?.length) score += 10;
    if (imageCount > 0) score += 10;
    return Math.min(score, 100);
  }

  private buildSearchTags(dto: ProfileCreationInput): string[] {
    const tags = [
      dto.personal.profileFor,
      dto.personal.religion,
      dto.personal.caste,
      dto.personal.city,
      dto.personal.state,
      dto.personal.country,
      dto.education.qualification,
      dto.education.occupation,
      ...(dto.preferences?.languagesKnown ?? []),
      ...(dto.preferences?.qualification ?? []),
    ];

    return Array.from(
      new Set(
        tags
          .filter(
            (value): value is string =>
              typeof value === 'string' && value.trim().length > 0,
          )
          .map((value) => value.trim().toLowerCase()),
      ),
    );
  }

  private async applyProfileUpdate(
    req: AppRequest,
    userId: string,
    dto: UpdateProfileDto,
    source: string,
  ) {
    const existingProfile = (await this.profileRepo.findByUserId(
      userId,
    )) as Record<string, unknown> | null;

    if (!existingProfile) {
      throw new BadRequestException('Profile not found');
    }

    const normalizedUpdate = this.normalizeProfileUpdate(dto, existingProfile);
    const result = await this.profileRepo.updateProfile(
      userId,
      normalizedUpdate,
    );
    await this.cache.del(`profile:${userId}`);

    const enrichedProfile = this.enrichProfileResponse(
      (result as unknown as Record<string, unknown>) ?? existingProfile,
    );

    await this.logProfileActivity(req, userId, source, normalizedUpdate);
    this.triggerProfileUpdateJobs(req, userId, source, normalizedUpdate);

    return enrichedProfile;
  }

  private normalizeProfileUpdate(
    dto: UpdateProfileDto,
    existingProfile: Record<string, unknown>,
  ): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};
    const currentPersonal = (existingProfile.personal ?? {}) as Record<
      string,
      unknown
    >;
    const currentPhysical = (existingProfile.physical ?? {}) as Record<
      string,
      unknown
    >;
    const currentEducation = (existingProfile.education ?? {}) as Record<
      string,
      unknown
    >;
    const currentPreferences = (existingProfile.preferences ?? {
      partnerPreference: {},
    }) as Record<string, unknown>;

    if (dto.personal) {
      const dateOfBirth = dto.personal.dateOfBirth
        ? new Date(dto.personal.dateOfBirth)
        : (currentPersonal.dateOfBirth as Date | undefined);
      normalized.personal = {
        ...currentPersonal,
        ...dto.personal,
        ...(dateOfBirth
          ? {
              dateOfBirth,
              age: this.calculateAge(dateOfBirth),
            }
          : {}),
      };
    }

    if (dto.physical) {
      normalized.physical = {
        ...currentPhysical,
        ...(dto.physical.height !== undefined
          ? { heightCm: dto.physical.height }
          : {}),
        ...(dto.physical.weight !== undefined
          ? { weight: dto.physical.weight }
          : {}),
        ...(dto.physical.bodyType !== undefined
          ? { bodyType: dto.physical.bodyType }
          : {}),
        ...(dto.physical.complexion !== undefined
          ? { complexion: dto.physical.complexion }
          : {}),
      };
    }

    if (dto.education) {
      const annualIncome = dto.education.annualIncome
        ? Number(dto.education.annualIncome)
        : undefined;
      normalized.education = {
        ...currentEducation,
        ...dto.education,
        ...(annualIncome !== undefined && Number.isFinite(annualIncome)
          ? { annualIncome }
          : dto.education.annualIncome === undefined
            ? {}
            : { annualIncome: undefined }),
      };
    }

    if (dto.family) {
      normalized.family = {
        ...((existingProfile.family ?? {}) as Record<string, unknown>),
        ...dto.family,
      };
    }

    if (dto.preferences) {
      normalized.preferences = {
        ...currentPreferences,
        ...dto.preferences,
      };
    }

    const mergedProfile = {
      ...existingProfile,
      ...normalized,
      personal: (normalized.personal ?? existingProfile.personal) as Record<
        string,
        unknown
      >,
      physical: (normalized.physical ?? existingProfile.physical) as Record<
        string,
        unknown
      >,
      education: (normalized.education ?? existingProfile.education) as Record<
        string,
        unknown
      >,
      family: (normalized.family ?? existingProfile.family) as Record<
        string,
        unknown
      >,
      preferences: (normalized.preferences ??
        existingProfile.preferences) as Record<string, unknown>,
    };

    Object.assign(normalized, this.buildDerivedProfileFields(mergedProfile));

    return normalized;
  }

  private buildDerivedProfileFields(
    profile: Record<string, unknown>,
  ): Record<string, unknown> {
    const personal = (profile.personal ?? {}) as Record<string, unknown>;
    const physical = (profile.physical ?? {}) as Record<string, unknown>;
    const education = (profile.education ?? {}) as Record<string, unknown>;
    const preferences = (profile.preferences ?? {}) as Record<string, unknown>;
    const profileImages = Array.isArray(profile.profileImages)
      ? (profile.profileImages as unknown[])
      : [];

    const dtoLikeProfile: ProfileCreationInput = {
      personal: {
        profileFor: String(personal.profileFor ?? ''),
        firstName: String(personal.firstName ?? ''),
        lastName:
          typeof personal.lastName === 'string' ? personal.lastName : undefined,
        gender: personal.gender as any,
        dateOfBirth:
          personal.dateOfBirth instanceof Date
            ? personal.dateOfBirth.toISOString()
            : String(personal.dateOfBirth ?? ''),
        religion: personal.religion as Religion,
        caste: typeof personal.caste === 'string' ? personal.caste : undefined,
        country:
          typeof personal.country === 'string' ? personal.country : undefined,
        state: typeof personal.state === 'string' ? personal.state : undefined,
        city: typeof personal.city === 'string' ? personal.city : undefined,
        motherTongue:
          typeof personal.motherTongue === 'string'
            ? personal.motherTongue
            : undefined,
        maritalStatus: personal.maritalStatus as any,
        aboutMe:
          typeof personal.aboutMe === 'string' ? personal.aboutMe : undefined,
      },
      physical: {
        height: Number(physical.heightCm ?? 0),
        weight:
          typeof physical.weight === 'number' ? physical.weight : undefined,
        bodyType:
          physical.bodyType as BodyType,
        complexion:
          physical.complexion as Complexion,
      },
      education: {
        qualification: String(education.qualification ?? ''),
        field:
          typeof education.field === 'string' ? education.field : undefined,
        university:
          typeof education.university === 'string'
            ? education.university
            : undefined,
        occupation: String(education.occupation ?? ''),
        annualIncome:
          typeof education.annualIncome === 'number'
            ? String(education.annualIncome)
            : undefined,
      },
      family: (profile.family ?? {}) as FamilyDto,
      preferences: preferences as PreferencesDto,
    };

    const completionPercentage = this.calculateProfileCompletion(
      dtoLikeProfile,
      profileImages.length,
    );

    return {
      profileFor: personal.profileFor,
      age: personal.age,
      heightCm: physical.heightCm,
      religion: personal.religion,
      caste: personal.caste,
      city: personal.city,
      gender: personal.gender,
      searchTags: this.buildSearchTags(dtoLikeProfile),
      profileCompletionPercentage: completionPercentage,
      profileScore: this.calculateProfileScore(
        dtoLikeProfile,
        profileImages.length,
      ),
    };
  }

  private calculateProfileCompletion(
    dto: ProfileCreationInput,
    imageCount: number,
  ): number {
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
      imageCount > 0,
      Boolean(dto.personal.aboutMe),
      Boolean(dto.preferences),
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }

  private enrichProfileResponse(profile: Record<string, unknown>) {
    const personal = (profile.personal ?? {}) as Record<string, unknown>;
    const physical = (profile.physical ?? {}) as Record<string, unknown>;
    const education = (profile.education ?? {}) as Record<string, unknown>;
    const preferences = (profile.preferences ?? {}) as Record<string, unknown>;
    const profileImages = Array.isArray(profile.profileImages)
      ? (profile.profileImages as unknown[])
      : [];
    const completionPercentage = Number(
      profile.profileCompletionPercentage ?? 0,
    );

    return {
      ...profile,
      summary: {
        profileCompletionPercentage: completionPercentage,
        profileScore: Number(profile.profileScore ?? 0),
        imageCount: profileImages.length,
        hasAboutMe: Boolean(personal.aboutMe),
        hasPartnerPreference: Boolean(preferences.partnerPreference),
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
        physical: {
          completed: Boolean(physical.heightCm),
        },
        education: {
          completed: Boolean(education.qualification && education.occupation),
        },
        family: {
          completed: Boolean(profile.family),
        },
        preferences: {
          completed: Boolean(preferences.partnerPreference),
        },
      },
    };
  }

  private async logProfileActivity(
    req: AppRequest,
    userId: string,
    source: string,
    patch: Record<string, unknown>,
  ) {
    await this.activityLogModel.create({
      userId,
      category: ActivityCategory.PROFILE,
      action: ActivityAction.UPDATE_PROFILE,
      ip: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
      device: this.getHeaderString(req, 'x-device-id'),
      userAgent: this.getHeaderString(req, 'user-agent'),
      requestId: req.requestId,
      correlationId: req.correlationId,
      platform: this.toActivityPlatform(
        this.getHeaderString(req, 'x-platform') || 'web',
      ),
      metadata: {
        source,
        changedFields: Object.keys(patch),
      },
    });
  }

  private triggerProfileUpdateJobs(
    req: AppRequest,
    userId: string,
    source: string,
    patch: Record<string, unknown>,
  ): void {
    const jobs: Array<Promise<unknown>> = [];

    jobs.push(
      this.notificationService.notify({
        userId,
        title:
          source === 'profile-preferences-update'
            ? 'Preferences updated'
            : 'Profile updated',
        message:
          source === 'profile-preferences-update'
            ? 'Your partner preferences were updated successfully.'
            : 'Your profile details were updated successfully.',
        type: 'system',
        category: 'system',
        channels: ['in_app', 'push'],
        metadata: {
          source,
          changedFields: Object.keys(patch),
        },
      }),
    );

    jobs.push(
      this.analyticsService.trackEvent({
        userId,
        eventType: AnalyticsEventType.PROFILE_UPDATED,
        ipAddress: req.ip || this.getHeaderString(req, 'x-forwarded-for'),
        userAgent: this.getHeaderString(req, 'user-agent'),
        platform: this.toAnalyticsPlatform(
          this.getHeaderString(req, 'x-platform') || 'web',
        ),
        metadata: {
          source,
          changedFields: Object.keys(patch),
        },
      }),
    );

    void Promise.allSettled(jobs);
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

  private toAnalyticsPlatform(platform: string): AnalyticsPlatform {
    if (platform === AnalyticsPlatform.IOS) {
      return AnalyticsPlatform.IOS;
    }
    if (platform === AnalyticsPlatform.ANDROID) {
      return AnalyticsPlatform.ANDROID;
    }
    if (platform === 'mobile') {
      return AnalyticsPlatform.API;
    }
    return AnalyticsPlatform.WEB;
  }

  private toActivityPlatform(platform: string): ActivityPlatform {
    if (platform === ActivityPlatform.IOS) {
      return ActivityPlatform.IOS;
    }
    if (platform === ActivityPlatform.ANDROID) {
      return ActivityPlatform.ANDROID;
    }
    return ActivityPlatform.WEB;
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

    // Fix rounding issue (e.g., 11.8 → 12)
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

  private feetInchesToCm(feet: number, inches: number): number {
    return Math.round((feet * 12 + inches) * 2.54);
  }
}
