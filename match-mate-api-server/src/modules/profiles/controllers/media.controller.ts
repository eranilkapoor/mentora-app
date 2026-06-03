import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Body,
  Query,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { MediaService } from '../services/media.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { ReviewMediaDto } from '../dto/media-review.dto';

@UseGuards(JwtAuthGuard)
@Controller('profiles/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Images

  @Get('images')
  async getImages(@Req() req: AuthenticatedRequest) {
    const data = await this.mediaService.getImages(req.user.sub);
    return successResponse(
      data,
      SuccessCode.PROFILE_IMAGE_FETCHED,
      'Profile images successfully fetched',
    );
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 10))
  @HttpCode(HttpStatus.CREATED)
  async uploadImages(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const data = await this.mediaService.addImages(req, req.user.sub, files);
    return successResponse(
      data,
      SuccessCode.PROFILE_IMAGE_UPLOADED,
      'Profile images successfully added',
    );
  }

  @Patch('images/:mediaId/primary')
  async setPrimaryImage(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = await this.mediaService.setPrimaryImage(
      req,
      req.user.sub,
      mediaId,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_IMAGE_REORDERED,
      'Profile image set successfully',
    );
  }

  @Delete('images/:mediaId')
  @HttpCode(HttpStatus.OK)
  async removeImage(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = await this.mediaService.removeImage(
      req,
      req.user.sub,
      mediaId,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_IMAGE_DELETED,
      'Profile images successfully deleted',
    );
  }

  // Videos

  @Get('videos')
  async getVideos(@Req() req: AuthenticatedRequest) {
    const data = await this.mediaService.getVideos(req.user.sub);
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_FETCHED,
      'Profile videos successfully fetched',
    );
  }

  @Post('videos')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videos', maxCount: 1 },
      { name: 'thumbnails', maxCount: 1 },
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadVideos(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles()
    files: {
      videos?: Express.Multer.File[];
      thumbnails?: Express.Multer.File[];
    },
  ) {
    const data = await this.mediaService.addVideos(
      req,
      req.user.sub,
      files.videos ?? [],
      files.thumbnails ?? [],
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_UPLOADED,
      'Profile videos successfully added',
    );
  }

  @Patch('videos/:mediaId/primary')
  async setPrimaryVideo(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = await this.mediaService.setPrimaryVideo(
      req,
      req.user.sub,
      mediaId,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_REORDERED,
      'Profile video set successfully',
    );
  }

  @Delete('videos/:mediaId')
  @HttpCode(HttpStatus.OK)
  async removeVideo(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = await this.mediaService.removeVideo(
      req,
      req.user.sub,
      mediaId,
    );
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_DELETED,
      'Profile video successfully deleted',
    );
  }

  @Get('admin/review-queue')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getReviewQueue(@Query('limit') limit?: string) {
    const data = await this.mediaService.getReviewQueue(
      limit ? Number(limit) : undefined,
    );
    return successResponse(data, SuccessCode.SUCCESS);
  }

  @Patch('admin/:mediaId/review')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async reviewMedia(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
    @Body() dto: ReviewMediaDto,
  ) {
    const data = await this.mediaService.reviewMedia(
      req.user.sub,
      mediaId,
      dto.approve,
      dto.note,
    );
    return successResponse(data, SuccessCode.FILE_UPLOADED);
  }
}
