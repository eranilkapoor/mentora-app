import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ValidationPipe,
  UploadedFiles,
} from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import {
  CreateProfileDto,
  PersonalDto,
  PhysicalDto,
  EducationDto,
  FamilyDto,
} from '../dto/create-profile.dto';
import { UpdatePrivacySettingsDto } from '../dto/privacy-media.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { OnboardingProfileDto } from 'src/modules/profile/dto/onboarding-profile.dto';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { SuccessCode } from 'src/common/constants';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseInterceptors(
    FilesInterceptor('profileImages', 6, {
      storage: memoryStorage(),
      fileFilter: (_, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowed.includes(file.mimetype)) {
          return cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
        }

        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @Post('onboarding')
  async onboardingProfile(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: OnboardingProfileDto,
    @UploadedFiles() profileImages: Express.Multer.File[],
  ) {
    const safeImages = profileImages ?? [];

    try {
      const data = await this.profileService.onboardingProfile(
        req,
        userId,
        dto,
        safeImages,
      );
      return new ApiResponse(
        true,
        SuccessCode.PROFILE_CREATED,
        'Onboarding profile saved successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save onboarding profile';
      return new ApiResponse(false, message);
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProfileDto,
  ) {
    return this.profileService.createProfile(req.user.sub, dto);
  }

  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    try {
      const data = await this.profileService.getMyProfile(req.user.sub);
      return new ApiResponse(
        true,
        SuccessCode.PROFILE_FETCHED,
        'Profile data successfully feathed',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to featch profile';
      return new ApiResponse(false, message);
    }
  }

  @Put('personal')
  updatePersonal(@Req() req: AuthenticatedRequest, @Body() dto: PersonalDto) {
    return this.profileService.updatePersonalInfo(req, req.user.sub, dto);
  }

  @Put('physical')
  updatePhysical(@Req() req: AuthenticatedRequest, @Body() dto: PhysicalDto) {
    return this.profileService.updatePhysicalInfo(req, req.user.sub, dto);
  }

  @Put('education')
  updateEducation(@Req() req: AuthenticatedRequest, @Body() dto: EducationDto) {
    return this.profileService.updateEducationInfo(req, req.user.sub, dto);
  }

  @Put('family')
  updateFamily(@Req() req: AuthenticatedRequest, @Body() dto: FamilyDto) {
    return this.profileService.updateFamilyInfo(req, req.user.sub, dto);
  }

  @Get('privacy')
  getPrivacy(@Req() req: AuthenticatedRequest) {
    return this.profileService.getPrivacySettings(req.user.sub);
  }

  @Put('privacy')
  updatePrivacy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePrivacySettingsDto,
  ) {
    return this.profileService.updatePrivacySettings(req, req.user.sub, dto);
  }
}
