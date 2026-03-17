import { Controller, Post, Get, Patch, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // TEMP: replace with Auth Guard
  private getUserId(): string {
    return 'USER_ID_FROM_AUTH';
  }

  @Post("/*path")
  create(@Body() dto: CreateProfileDto) {
    return this.profileService.createProfile(this.getUserId(), dto);
  }

  @Patch("/*path")
  update(@Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(this.getUserId(), dto);
  }

  @Get('me')
  getMyProfile() {
    return this.profileService.getMyProfile(this.getUserId());
  }
}
