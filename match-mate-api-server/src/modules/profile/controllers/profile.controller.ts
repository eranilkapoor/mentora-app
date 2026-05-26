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
import { UpdateProfileLocationDto } from 'src/modules/profile/dto/location.dto';
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
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
    const data = await this.profileService.onboardingProfile(
      req,
      userId,
      dto,
      safeImages,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_CREATED,
      'Onboarding profile saved successfully',
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProfileDto,
  ) {
    const data = await this.profileService.createProfile(req.user.sub, dto);
    return successResponse(
      data,
      SuccessCode.PROFILE_CREATED,
      'Onboarding profile saved successfully',
    );
  }

  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const data = await this.profileService.getMyProfile(req.user.sub);
    return successResponse(
      data,
      SuccessCode.PROFILE_FETCHED,
      'Profile data successfully fetched',
    );
  }

  @Put('personal')
  async updatePersonal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PersonalDto,
  ) {
    const data = await this.profileService.updatePersonalInfo(
      req,
      req.user.sub,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_UPDATED,
      'Profile successfully updated',
    );
  }

  @Put('physical')
  async updatePhysical(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PhysicalDto,
  ) {
    const data = await this.profileService.updatePhysicalInfo(
      req,
      req.user.sub,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_UPDATED,
      'Profile successfully updated',
    );
  }

  @Put('education')
  async updateEducation(
    @Req() req: AuthenticatedRequest,
    @Body() dto: EducationDto,
  ) {
    const data = await this.profileService.updateEducationInfo(
      req,
      req.user.sub,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_UPDATED,
      'Profile successfully updated',
    );
  }

  @Put('family')
  async updateFamily(@Req() req: AuthenticatedRequest, @Body() dto: FamilyDto) {
    const data = await this.profileService.updateFamilyInfo(
      req,
      req.user.sub,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_UPDATED,
      'Profile successfully updated',
    );
  }

  @Put('location')
  async updateLocation(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileLocationDto,
  ) {
    const data = await this.profileService.updateLocation(
      req,
      req.user.sub,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_UPDATED,
      'Profile location successfully updated',
    );
  }

  @Get('privacy')
  async getPrivacy(@Req() req: AuthenticatedRequest) {
    const data = await this.profileService.getPrivacySettings(req.user.sub);
    return successResponse(
      data,
      SuccessCode.PROFILE_PRIVACY_SETTINGS_FETCHED,
      'Profile privacy successfully fetched',
    );
  }

  @Put('privacy')
  async updatePrivacy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePrivacySettingsDto,
  ) {
    const data = await this.profileService.updatePrivacySettings(
      req,
      req.user.sub,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_PRIVACY_SETTINGS_UPDATED,
      'Profile privacy successfully updated',
    );
  }
}
