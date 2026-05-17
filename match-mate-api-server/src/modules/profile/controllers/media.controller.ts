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
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { SuccessCode } from 'src/common/constants';

@UseGuards(JwtAuthGuard)
@Controller('profile/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ─── Images ────────────────────────────────────────────────────────────────

  @Get('images')
  async getImages(@Req() req: AuthenticatedRequest) {
    const data = await this.mediaService.getImages(req.user.sub);
    return new ApiResponse(
      true,
      SuccessCode.PROFILE_IMAGE_FETCHED,
      'Profile images successfully feathed',
      data,
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
    return new ApiResponse(
      true,
      SuccessCode.PROFILE_IMAGE_UPLOADED,
      'Profile images successfully added',
      data,
    );
  }

  @Patch('images/:mediaId/primary')
  setPrimaryImage(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.setPrimaryImage(req, req.user.sub, mediaId);
  }

  @Delete('images/:mediaId')
  @HttpCode(HttpStatus.OK)
  removeImage(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.removeImage(req, req.user.sub, mediaId);
  }

  // ─── Videos ────────────────────────────────────────────────────────────────

  @Get('videos')
  getVideos(@Req() req: AuthenticatedRequest) {
    return this.mediaService.getVideos(req.user.sub);
  }

  @Post('videos')
  @UseInterceptors(FilesInterceptor('videos', 3))
  @HttpCode(HttpStatus.CREATED)
  uploadVideos(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.mediaService.addVideos(req, req.user.sub, files);
  }

  @Patch('videos/:mediaId/primary')
  setPrimaryVideo(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.setPrimaryVideo(req, req.user.sub, mediaId);
  }

  @Delete('videos/:mediaId')
  @HttpCode(HttpStatus.OK)
  removeVideo(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.removeVideo(req, req.user.sub, mediaId);
  }
}
