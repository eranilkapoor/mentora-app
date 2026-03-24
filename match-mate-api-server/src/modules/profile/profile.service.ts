import { Injectable, BadRequestException } from '@nestjs/common';
import { ProfileRepository } from './repositories/profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async createProfile(userId: string, dto: any) {
    try {
      const existing = await this.profileRepo.findByUserId(userId);
      if (existing) {
        throw new BadRequestException('Profile already exists');
      }
      return await this.profileRepo.createProfile(userId, dto);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to create profile');
    }
  }

  async updateProfile(userId: string, dto: any) {
    try {
      return await this.profileRepo.updateProfile(userId, dto);
    } catch (error) {
      throw new BadRequestException('Failed to update profile');
    }
  }

  async updatePersonalInfo(userId: string, dto: any) {
    try {
      return await this.profileRepo.updatePersonalInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException('Failed to update personal info');
    }
  }

  async updatePhysicalInfo(userId: string, dto: any) {
    try {
      return await this.profileRepo.updatePhysicalInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException('Failed to update physical info');
    }
  }

  async updateEducationInfo(userId: string, dto: any) {
    try {
      return await this.profileRepo.updateEducationInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException('Failed to update education info');
    }
  }

  async updateFamilyInfo(userId: string, dto: any) {
    try {
      return await this.profileRepo.updateFamilyInfo(userId, dto);
    } catch (error) {
      throw new BadRequestException('Failed to update family info');
    }
  }

  async updatePreferences(userId: string, dto: any) {
    try {
      return await this.profileRepo.updatePreferences(userId, dto);
    } catch (error) {
      throw new BadRequestException('Failed to update preferences');
    }
  }

  async getMyProfile(userId: string) {
    try {
      return await this.profileRepo.findByUserId(userId);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve profile');
    }
  }
}
