import { Injectable, Inject } from '@nestjs/common';
import { MediaRepository } from '../repositories/media.repository';
import { StorageService } from '../../storage/services/storage.service';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import { AppRequest } from '@/common/interfaces/app-request.interface';
import { MediaType } from '@/common/enums';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwForbidden,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { AppException } from '@/common/exceptions/app.exception';

const MAX_IMAGES = 10;
const MAX_VIDEOS = 1;
const IMAGE_STORAGE_FOLDER = 'profiles/images';
const VIDEO_STORAGE_FOLDER = 'profiles/videos';
const VIDEO_THUMBNAIL_STORAGE_FOLDER = 'profiles/video-thumbnails';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepo: MediaRepository,
    private readonly storageService: StorageService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  //  Images

  async addImages(
    _req: AppRequest,
    userId: string,
    files: Express.Multer.File[],
    primaryIndex?: number,
  ) {
    try {
      const currentCount = await this.mediaRepo.countByUser(
        userId,
        MediaType.IMAGE,
      );

      if (currentCount + files.length > MAX_IMAGES) {
        throwBadRequest(ErrorCode.PROFILE_IMAGE_LIMIT_EXCEEDED, {
          limit: MAX_IMAGES,
          currentCount,
        });
      }

      const uploaded = await this.storageService.uploadFiles(
        files,
        IMAGE_STORAGE_FOLDER,
      );

      const hasPrimary = await this.mediaRepo.hasPrimary(
        userId,
        MediaType.IMAGE,
      );

      const inputs = uploaded.map((img, index) => ({
        ...img,
        type: MediaType.IMAGE,
        isPrimary: !hasPrimary && index === primaryIndex,
      }));

      const result = await this.mediaRepo.create(userId, inputs);
      await this.invalidateCache(userId);

      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.FILE_UPLOAD_FAILED);
    }
  }

  async getImages(userId: string) {
    try {
      return await this.mediaRepo.findAllByUser(userId, MediaType.IMAGE);
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.PROFILE_IMAGE_NOT_FOUND);
    }
  }

  async setPrimaryImage(_req: AppRequest, userId: string, mediaId: string) {
    try {
      await this.assertOwnership(userId, mediaId);
      const result = await this.mediaRepo.setPrimary(
        userId,
        mediaId,
        MediaType.IMAGE,
      );
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.PROFILE_IMAGE_NOT_FOUND);
    }
  }

  async removeImage(_req: AppRequest, userId: string, mediaId: string) {
    try {
      const media = await this.assertOwnership(userId, mediaId);
      await this.mediaRepo.softDelete(mediaId);

      if (media.filename) {
        await this.storageService.deleteFile(
          media.filename,
          IMAGE_STORAGE_FOLDER,
        );
      }

      // If the deleted image was primary, promote the next one
      if (media.isPrimary) {
        const remaining = await this.mediaRepo.findAllByUser(
          userId,
          MediaType.IMAGE,
        );
        if (remaining.length > 0 && remaining[0]._id) {
          await this.mediaRepo.setPrimary(
            userId,
            String(remaining[0]._id),
            MediaType.IMAGE,
          );
        }
      }

      await this.invalidateCache(userId);

      return { success: true };
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.FILE_UPLOAD_FAILED, {
        reason: 'failed_to_remove_image',
      });
    }
  }

  //  Videos

  async addVideos(
    _req: AppRequest,
    userId: string,
    files: Express.Multer.File[],
    thumbnails: Express.Multer.File[] = [],
  ) {
    try {
      const currentCount = await this.mediaRepo.countByUser(
        userId,
        MediaType.VIDEO,
      );
      if (currentCount + files.length > MAX_VIDEOS) {
        throwBadRequest(ErrorCode.FILE_TOO_LARGE, {
          limit: MAX_VIDEOS,
          currentCount,
        });
      }

      const uploaded = await this.storageService.uploadFiles(
        files,
        VIDEO_STORAGE_FOLDER,
      );
      const uploadedThumbnails = await this.storageService.uploadFiles(
        thumbnails.slice(0, files.length),
        VIDEO_THUMBNAIL_STORAGE_FOLDER,
      );

      const hasPrimary = await this.mediaRepo.hasPrimary(
        userId,
        MediaType.VIDEO,
      );

      const inputs = uploaded.map((vid, index) => ({
        ...vid,
        type: MediaType.VIDEO,
        thumbnailUrl: uploadedThumbnails[index]?.url,
        mimeType: files[index]?.mimetype,
        size: files[index]?.size,
        isPrimary: !hasPrimary && index === 0,
      }));

      const result = await this.mediaRepo.create(userId, inputs);
      await this.invalidateCache(userId);

      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.FILE_UPLOAD_FAILED);
    }
  }

  async getVideos(userId: string) {
    try {
      return await this.mediaRepo.findAllByUser(userId, MediaType.VIDEO);
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.FILE_NOT_FOUND);
    }
  }

  async setPrimaryVideo(_req: AppRequest, userId: string, mediaId: string) {
    try {
      await this.assertOwnership(userId, mediaId);
      const result = await this.mediaRepo.setPrimary(
        userId,
        mediaId,
        MediaType.VIDEO,
      );
      await this.invalidateCache(userId);

      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.FILE_NOT_FOUND, {
        reason: 'failed_to_set_primary_video',
      });
    }
  }

  async removeVideo(_req: AppRequest, userId: string, mediaId: string) {
    try {
      const media = await this.assertOwnership(userId, mediaId);
      await this.mediaRepo.softDelete(mediaId);

      if (media.filename) {
        await this.storageService.deleteFile(
          media.filename,
          VIDEO_STORAGE_FOLDER,
        );
      }

      if (media.thumbnailUrl) {
        const thumbnailFilename = media.thumbnailUrl.split('/').pop();
        if (thumbnailFilename) {
          await this.storageService.deleteFile(
            thumbnailFilename,
            VIDEO_THUMBNAIL_STORAGE_FOLDER,
          );
        }
      }

      await this.invalidateCache(userId);

      return { success: true };
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.FILE_UPLOAD_FAILED, {
        reason: 'failed_to_remove_video',
      });
    }
  }

  //  Helpers

  private async assertOwnership(
    userId: string,
    mediaId: string,
  ): Promise<NonNullable<Awaited<ReturnType<MediaRepository['findById']>>>> {
    const media = await this.mediaRepo.findById(mediaId);

    if (!media) {
      return throwNotFound(ErrorCode.FILE_NOT_FOUND);
    }

    if (String(media.userId) !== userId) {
      return throwForbidden(ErrorCode.ACCESS_DENIED, {
        reason: 'media_not_owned',
      });
    }

    return media;
  }

  private async invalidateCache(userId: string) {
    await this.cache.del(`profile:${userId}`);
    await this.cache.del(`media:images:${userId}`);
    await this.cache.del(`media:videos:${userId}`);
  }
}
