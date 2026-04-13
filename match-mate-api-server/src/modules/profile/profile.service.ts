import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ProfileRepository } from './repositories/profile.repository';
import {
  CreateProfileDto,
  EducationDto,
  FamilyDto,
  PersonalDto,
  PhysicalDto,
  PreferencesDto,
} from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { ICacheService } from 'src/modules/cache/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/cache.interface';

// ─── Image type ───────────────────────────────────────────────────────────────

export interface ProfileImageInput {
  url: string;
  isPrimary: boolean;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateProfileDto,
    images: ProfileImageInput[] = [],
  ) {
    try {
      const existing = await this.profileRepo.findByUserId(userId);
      if (existing) {
        throw new BadRequestException('Profile already exists');
      }

      const imageDocuments = images.map((img) => ({
        ...img,
        isActive: true,
        uploadedAt: new Date(),
      }));

      return await this.profileRepo.createProfile(userId, dto, imageDocuments);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create profile',
      );
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    try {
      const result = await this.profileRepo.updateProfile(userId, dto);

      // Invalidate cache on update
      await this.cache.del(`profile:${userId}`);

      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    }
  }

  async updatePersonalInfo(userId: string, dto: PersonalDto) {
    try {
      return await this.profileRepo.updatePersonalInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update personal info',
      );
    }
  }

  async updatePhysicalInfo(userId: string, dto: PhysicalDto) {
    try {
      return await this.profileRepo.updatePhysicalInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update physical info',
      );
    }
  }

  async updateEducationInfo(userId: string, dto: EducationDto) {
    try {
      return await this.profileRepo.updateEducationInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update education info',
      );
    }
  }

  async updateFamilyInfo(userId: string, dto: FamilyDto) {
    try {
      return await this.profileRepo.updateFamilyInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update family info',
      );
    }
  }

  async updatePreferences(userId: string, dto: PreferencesDto) {
    try {
      return await this.profileRepo.updatePreferences(userId, dto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update preferences',
      );
    }
  }

  // ─── Image Methods ──────────────────────────────────────────────────────────

  async addImages(userId: string, images: ProfileImageInput[]) {
    try {
      const imageDocuments = images.map((img) => ({
        ...img,
        isActive: true,
        uploadedAt: new Date(),
      }));
      return await this.profileRepo.addImages(userId, imageDocuments);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to add images',
      );
    }
  }

  async setPrimaryImage(userId: string, imageId: string) {
    try {
      return await this.profileRepo.setPrimaryImage(userId, imageId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to set primary image',
      );
    }
  }

  async removeImage(userId: string, imageId: string) {
    try {
      return await this.profileRepo.removeImage(userId, imageId);
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

  async getMyProfile(userId: string) {
    try {
      const cacheKey = `profile:${userId}`;

      // Try cache first
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) return cached;

      // Fetch from DB
      const profile = await this.profileRepo.findByUserId(userId);

      // Cache for 5 minutes
      await this.cache.set(cacheKey, profile, 300);

      return profile;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve profile',
      );
    }
  }
}
