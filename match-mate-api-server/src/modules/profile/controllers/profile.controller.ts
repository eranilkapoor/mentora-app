import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
  Param,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProfileService } from '../services/profile.service';
import {
  CreateProfileDto,
  EducationDto,
  FamilyDto,
  PersonalDto,
  PhysicalDto,
  PreferencesDto,
} from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ApiResponse } from 'src/common/dto/response.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { UpdatePrivacySettingsDto } from '../dto/privacy-media.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateProfileDto,
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
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: UpdateProfileDto,
  ) {
    try {
      const data = await this.profileService.updateProfile(req, userId, dto);
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
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: PersonalDto,
  ) {
    try {
      const data = await this.profileService.updatePersonalInfo(
        req,
        userId,
        dto,
      );
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
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: PhysicalDto,
  ) {
    try {
      const data = await this.profileService.updatePhysicalInfo(
        req,
        userId,
        dto,
      );
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
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: EducationDto,
  ) {
    try {
      const data = await this.profileService.updateEducationInfo(
        req,
        userId,
        dto,
      );
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
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: FamilyDto,
  ) {
    try {
      const data = await this.profileService.updateFamilyInfo(req, userId, dto);
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
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: PreferencesDto,
  ) {
    try {
      const data = await this.profileService.updatePreferences(
        req,
        userId,
        dto,
      );
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
  async getMyProfile(@CurrentUser('sub') userId: string) {
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

  @Get('privacy')
  @ApiOperation({ summary: 'Get privacy settings for current user' })
  async getPrivacySettings(@CurrentUser('sub') userId: string) {
    try {
      const data = await this.profileService.getPrivacySettings(userId);
      return new ApiResponse(
        true,
        'Privacy settings retrieved successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to retrieve privacy settings';
      return new ApiResponse(false, message, null);
    }
  }

  @Patch('privacy')
  @ApiOperation({ summary: 'Update privacy settings for current user' })
  async updatePrivacySettings(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: UpdatePrivacySettingsDto,
  ) {
    try {
      const data = await this.profileService.updatePrivacySettings(
        req,
        userId,
        dto,
      );
      return new ApiResponse(
        true,
        'Privacy settings updated successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update privacy settings';
      return new ApiResponse(false, message, null);
    }
  }

  @Get('images')
  @ApiOperation({ summary: 'List profile images for current user' })
  async getImages(@CurrentUser('sub') userId: string) {
    try {
      const data = await this.profileService.getImages(userId);
      return new ApiResponse(
        true,
        'Profile images retrieved successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to retrieve profile images';
      return new ApiResponse(false, message, null);
    }
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload profile images for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['images'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      fileFilter: (_, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async addImages(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const data = await this.profileService.addImages(
        req,
        userId,
        files ?? [],
      );
      return new ApiResponse(
        true,
        'Profile images uploaded successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to upload profile images';
      return new ApiResponse(false, message, null);
    }
  }

  @Patch('images/:imageId/primary')
  @ApiOperation({ summary: 'Set a profile image as primary' })
  @ApiParam({ name: 'imageId', type: String })
  async setPrimaryImage(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Param('imageId') imageId: string,
  ) {
    try {
      const data = await this.profileService.setPrimaryImage(
        req,
        userId,
        imageId,
      );
      return new ApiResponse(true, 'Primary image updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to set primary image';
      return new ApiResponse(false, message, null);
    }
  }

  @Delete('images/:imageId')
  @ApiOperation({ summary: 'Delete a profile image' })
  @ApiParam({ name: 'imageId', type: String })
  async removeImage(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Param('imageId') imageId: string,
  ) {
    try {
      const data = await this.profileService.removeImage(req, userId, imageId);
      return new ApiResponse(true, 'Profile image removed successfully', data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to remove profile image';
      return new ApiResponse(false, message, null);
    }
  }

  @Get('videos')
  @ApiOperation({ summary: 'List profile videos for current user' })
  async getVideos(@CurrentUser('sub') userId: string) {
    try {
      const data = await this.profileService.getVideos(userId);
      return new ApiResponse(
        true,
        'Profile videos retrieved successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to retrieve profile videos';
      return new ApiResponse(false, message, null);
    }
  }

  @Post('videos')
  @ApiOperation({ summary: 'Upload profile videos for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        videos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['videos'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('videos', 5, {
      storage: memoryStorage(),
      fileFilter: (_, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new Error('Only MP4, WEBM, MOV videos are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async addVideos(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const data = await this.profileService.addVideos(
        req,
        userId,
        files ?? [],
      );
      return new ApiResponse(
        true,
        'Profile videos uploaded successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to upload profile videos';
      return new ApiResponse(false, message, null);
    }
  }

  @Patch('videos/:videoId/primary')
  @ApiOperation({ summary: 'Set a profile video as primary' })
  @ApiParam({ name: 'videoId', type: String })
  async setPrimaryVideo(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Param('videoId') videoId: string,
  ) {
    try {
      const data = await this.profileService.setPrimaryVideo(
        req,
        userId,
        videoId,
      );
      return new ApiResponse(true, 'Primary video updated successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to set primary video';
      return new ApiResponse(false, message, null);
    }
  }

  @Delete('videos/:videoId')
  @ApiOperation({ summary: 'Delete a profile video' })
  @ApiParam({ name: 'videoId', type: String })
  async removeVideo(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Param('videoId') videoId: string,
  ) {
    try {
      const data = await this.profileService.removeVideo(req, userId, videoId);
      return new ApiResponse(true, 'Profile video removed successfully', data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to remove profile video';
      return new ApiResponse(false, message, null);
    }
  }
}
