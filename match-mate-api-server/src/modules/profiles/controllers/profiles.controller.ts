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
import { ProfilesService } from '../services/profiles.service';
import {
  CreateProfileDto,
  PersonalDto,
  PhysicalDto,
  EducationDto,
  FamilyDto,
} from '../dto/create-profile.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { OnboardingProfileDto } from '@/modules/profiles/dto/onboarding-profile.dto';
import { UpdateProfileLocationDto } from '@/modules/profiles/dto/location.dto';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

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
    const data = await this.profilesService.onboardingProfile(
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
    const data = await this.profilesService.createProfile(req.user.sub, dto);
    return successResponse(
      data,
      SuccessCode.PROFILE_CREATED,
      'Onboarding profile saved successfully',
    );
  }

  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const data = await this.profilesService.getMyProfile(req.user.sub);
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
    const data = await this.profilesService.updatePersonalInfo(
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
    const data = await this.profilesService.updatePhysicalInfo(
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
    const data = await this.profilesService.updateEducationInfo(
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
    const data = await this.profilesService.updateFamilyInfo(
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
    const data = await this.profilesService.updateLocation(
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
}
