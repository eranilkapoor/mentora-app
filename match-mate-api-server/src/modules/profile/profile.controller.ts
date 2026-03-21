import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from 'src/common/response.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async create(@CurrentUser('userId') userId: string, @Body() dto: CreateProfileDto) {
    const data = await this.profileService.createProfile(userId, dto);
    return new ApiResponse(true, 'Profile created successfully', data);
  }

  @Patch()
  async update(@CurrentUser('userId') userId: string, @Body() dto: UpdateProfileDto) {
    const data = await this.profileService.updateProfile(userId, dto);
    return new ApiResponse(true, 'Profile updated successfully', data);
  }

  @Get('me')
  async getMyProfile(@CurrentUser('userId') userId: string) {
    const data = await this.profileService.getMyProfile(userId);
    return new ApiResponse(true, 'Profile retrieved successfully', data);
  }
}
