import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { InitiateEkycDto, ReviewKycDto, SubmitKycDto } from '../dto/kyc.dto';
import { KycService } from '../services/kyc.service';
import { VerificationStatus } from '../schemas/verification.schema';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('me')
  async getMyStatus(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.kycService.getMyStatus(req.user.sub),
      SuccessCode.PROFILE_FETCHED,
      'Verification status fetched',
    );
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'idProof', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 8 * 1024 * 1024 },
      },
    ),
  )
  async submitManual(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubmitKycDto,
    @UploadedFiles()
    files: {
      idProof?: Express.Multer.File[];
      selfie?: Express.Multer.File[];
    },
  ) {
    return successResponse(
      await this.kycService.submitManual(req.user.sub, dto, files),
      SuccessCode.PROFILE_UPDATED,
      'Verification submitted for review',
    );
  }

  @Post('ekyc/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateEkyc(
    @Req() req: AuthenticatedRequest,
    @Body() dto: InitiateEkycDto,
  ) {
    return successResponse(
      await this.kycService.initiateEkyc(req.user.sub, dto),
      SuccessCode.PROFILE_UPDATED,
      'eKYC verification initiated',
    );
  }

  @Get('admin/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getReviewQueue(
    @Query('status') status: VerificationStatus = VerificationStatus.PENDING,
  ) {
    return successResponse(
      await this.kycService.getReviewQueue(status),
      SuccessCode.ADMIN_USERS_FETCHED,
      'Verification review queue fetched',
    );
  }

  @Post('admin/:userId/review')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async review(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() dto: ReviewKycDto,
  ) {
    return successResponse(
      await this.kycService.review(userId, req.user.sub, dto),
      SuccessCode.ADMIN_PROFILE_APPROVED,
      'Verification review completed',
    );
  }
}
