import { Injectable, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    try {
      const existing = await this.profileRepo.findByUserId(userId);
      if (existing) {
        throw new BadRequestException('Profile already exists');
      }
      return await this.profileRepo.createProfile(userId, dto);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create profile',
      );
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    try {
      return await this.profileRepo.updateProfile(userId, dto);
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

  async getMyProfile(userId: string) {
    try {
      return await this.profileRepo.findByUserId(userId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve profile',
      );
    }
  }
}
