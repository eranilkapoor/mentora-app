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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../services/media.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

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
  setPrimaryImage(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = this.mediaService.setPrimaryImage(req, req.user.sub, mediaId);
    return successResponse(
      data,
      SuccessCode.PROFILE_IMAGE_REORDERED,
      'Profile image set successfully',
    );
  }

  @Delete('images/:mediaId')
  @HttpCode(HttpStatus.OK)
  removeImage(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = this.mediaService.removeImage(req, req.user.sub, mediaId);
    return successResponse(
      data,
      SuccessCode.PROFILE_IMAGE_DELETED,
      'Profile images successfully deleted',
    );
  }

  // Videos

  @Get('videos')
  getVideos(@Req() req: AuthenticatedRequest) {
    const data = this.mediaService.getVideos(req.user.sub);
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_FETCHED,
      'Profile videos successfully fetched',
    );
  }

  @Post('videos')
  @UseInterceptors(FilesInterceptor('videos', 3))
  @HttpCode(HttpStatus.CREATED)
  uploadVideos(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const data = this.mediaService.addVideos(req, req.user.sub, files);
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_UPLOADED,
      'Profile videos successfully added',
    );
  }

  @Patch('videos/:mediaId/primary')
  setPrimaryVideo(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = this.mediaService.setPrimaryVideo(req, req.user.sub, mediaId);
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_REORDERED,
      'Profile video set successfully',
    );
  }

  @Delete('videos/:mediaId')
  @HttpCode(HttpStatus.OK)
  removeVideo(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    const data = this.mediaService.removeVideo(req, req.user.sub, mediaId);
    return successResponse(
      data,
      SuccessCode.PROFILE_VIDEO_DELETED,
      'Profile video successfully deleted',
    );
  }
}
