import { Injectable, BadRequestException } from '@nestjs/common';
import { ProfileRepository } from './repositories/profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async createProfile(userId: string, dto: any) {
    const existing = await this.profileRepo.findByUserId(userId);
    if (existing) {
      throw new BadRequestException('Profile already exists');
    }

    return await this.profileRepo.createProfile(userId, dto);
  }

  async updateProfile(userId: string, dto: any) {
    return await this.profileRepo.updateProfile(userId, dto);
  }

  async getMyProfile(userId: string) {
    return await this.profileRepo.findByUserId(userId);
  }
}
