import { Injectable, BadRequestException } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repo: ProfileRepository) {}

  async createProfile(userId: string, dto: any) {
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      throw new BadRequestException('Profile already exists');
    }

    const profile = await this.repo.createProfile(userId, dto);

    return this.markProfileCompletion(profile);
  }

  async updateProfile(userId: string, dto: any) {
    const profile = await this.repo.updateProfile(userId, dto);
    return this.markProfileCompletion(profile);
  }

  getMyProfile(userId: string) {
    return this.repo.findByUserId(userId);
  }

  private markProfileCompletion(profile: any) {
    const requiredFields = [
      'firstName',
      'gender',
      'dateOfBirth',
      'religion',
      'education',
      'location',
    ];

    const completed = requiredFields.every((f) => profile[f]);

    if (profile.isProfileComplete !== completed) {
      profile.isProfileComplete = completed;
      profile.save();
    }

    return profile;
  }
}
