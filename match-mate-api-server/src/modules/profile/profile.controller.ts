import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  CreateProfileDto,
  EducationDto,
  FamilyDto,
  PersonalDto,
  PhysicalDto,
  PreferencesDto,
} from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from 'src/common/response.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateProfileDto,
  ) {
    try {
      const data = await this.profileService.createProfile(userId, dto);
      return new ApiResponse(true, 'Profile created successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create profile';
      return new ApiResponse(
        false,
        message || 'Failed to create profile',
        null,
      );
    }
  }

  @Patch()
  async update(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    try {
      const data = await this.profileService.updateProfile(userId, dto);
      return new ApiResponse(true, 'Profile updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile';
      return new ApiResponse(
        false,
        message || 'Failed to update profile',
        null,
      );
    }
  }

  @Patch('personal')
  async updatePersonal(
    @CurrentUser('userId') userId: string,
    @Body() dto: PersonalDto,
  ) {
    try {
      const data = await this.profileService.updatePersonalInfo(userId, dto);
      return new ApiResponse(true, 'Personal info updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update personal info';
      return new ApiResponse(
        false,
        message || 'Failed to update personal info',
        null,
      );
    }
  }

  @Patch('physical')
  async updatePhysical(
    @CurrentUser('userId') userId: string,
    @Body() dto: PhysicalDto,
  ) {
    try {
      const data = await this.profileService.updatePhysicalInfo(userId, dto);
      return new ApiResponse(true, 'Physical info updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update physical info';
      return new ApiResponse(
        false,
        message || 'Failed to update physical info',
        null,
      );
    }
  }

  @Patch('education')
  async updateEducation(
    @CurrentUser('userId') userId: string,
    @Body() dto: EducationDto,
  ) {
    try {
      const data = await this.profileService.updateEducationInfo(userId, dto);
      return new ApiResponse(true, 'Education info updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update education info';
      return new ApiResponse(
        false,
        message || 'Failed to update education info',
        null,
      );
    }
  }

  @Patch('family')
  async updateFamily(
    @CurrentUser('userId') userId: string,
    @Body() dto: FamilyDto,
  ) {
    try {
      const data = await this.profileService.updateFamilyInfo(userId, dto);
      return new ApiResponse(true, 'Family info updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update family info';
      return new ApiResponse(
        false,
        message || 'Failed to update family info',
        null,
      );
    }
  }

  @Patch('preferences')
  async updatePreferences(
    @CurrentUser('userId') userId: string,
    @Body() dto: PreferencesDto,
  ) {
    try {
      const data = await this.profileService.updatePreferences(userId, dto);
      return new ApiResponse(true, 'Preferences updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update preferences';
      return new ApiResponse(
        false,
        message || 'Failed to update preferences',
        null,
      );
    }
  }

  @Get('me')
  async getMyProfile(@CurrentUser('userId') userId: string) {
    try {
      const data = await this.profileService.getMyProfile(userId);
      return new ApiResponse(true, 'Profile retrieved successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to retrieve profile';
      return new ApiResponse(
        false,
        message || 'Failed to retrieve profile',
        null,
      );
    }
  }
}
