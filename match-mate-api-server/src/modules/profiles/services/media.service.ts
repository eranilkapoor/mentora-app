import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaRepository } from '../repositories/media.repository';
import { Profile, ProfileDocument } from '../schemas/profile/profile.schema';
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
import { ProfileScoringService } from './profile-scoring.service';
import { MediaModerationService } from './media-moderation.service';
import { VideoThumbnailService } from './video-thumbnail.service';

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
    private readonly profileScoringService: ProfileScoringService,
    private readonly moderationService: MediaModerationService,
    private readonly videoThumbnailService: VideoThumbnailService,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
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

      const moderation = files.map((file) =>
        this.moderationService.moderate(file, MediaType.IMAGE),
      );
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
        moderationStatus: moderation[index].status,
        moderationReasons: moderation[index].reasons,
        moderationMetadata: moderation[index].metadata,
      }));

      const result = await this.mediaRepo.create(userId, inputs);
      await this.invalidateCache(userId);
      await this.refreshProfileScores(userId);

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
      await this.refreshProfileScores(userId);
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
      await this.refreshProfileScores(userId);

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

      const moderation = files.map((file) =>
        this.moderationService.moderate(file, MediaType.VIDEO),
      );
      const generatedThumbnails =
        thumbnails.length > 0
          ? thumbnails
          : (
              await Promise.all(
                files.map((file) =>
                  this.videoThumbnailService.generateThumbnail(file),
                ),
              )
            ).filter((file): file is Express.Multer.File => Boolean(file));

      const uploaded = await this.storageService.uploadFiles(
        files,
        VIDEO_STORAGE_FOLDER,
      );
      const uploadedThumbnails = await this.storageService.uploadFiles(
        generatedThumbnails.slice(0, files.length),
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
        moderationStatus: moderation[index].status,
        moderationReasons: moderation[index].reasons,
        moderationMetadata: moderation[index].metadata,
      }));

      const result = await this.mediaRepo.create(userId, inputs);
      await this.invalidateCache(userId);
      await this.refreshProfileScores(userId);

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
      await this.refreshProfileScores(userId);

      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.FILE_NOT_FOUND, {
        reason: 'failed_to_set_primary_video',
      });
    }
  }

  getReviewQueue(limit?: number) {
    return this.mediaRepo.getReviewQueue(limit);
  }

  async reviewMedia(
    reviewerId: string,
    mediaId: string,
    approve: boolean,
    note?: string,
  ) {
    const media = await this.mediaRepo.review(
      mediaId,
      reviewerId,
      approve,
      note,
    );
    if (media?.userId) {
      await this.invalidateCache(String(media.userId));
      await this.refreshProfileScores(String(media.userId));
    }
    return media;
  }

  async cleanupDeletedMedia(retentionDays = 7, limit = 100) {
    const safeRetentionDays = Math.max(0, retentionDays);
    const safeLimit = Math.min(Math.max(limit, 1), 500);
    const cutoff = new Date(
      Date.now() - safeRetentionDays * 24 * 60 * 60 * 1000,
    );
    const deletedMedia = await this.mediaRepo.findDeletedOlderThan(
      cutoff,
      safeLimit,
    );

    let fileDeleteCount = 0;
    let recordDeleteCount = 0;
    const failedMediaIds: string[] = [];

    for (const media of deletedMedia) {
      try {
        if (media.filename) {
          await this.storageService.deleteFile(
            media.filename,
            this.getStorageFolder(media.type),
          );
          fileDeleteCount += 1;
        }

        if (media.thumbnailUrl) {
          const thumbnailFilename = this.extractFilename(media.thumbnailUrl);
          if (thumbnailFilename) {
            await this.storageService.deleteFile(
              thumbnailFilename,
              VIDEO_THUMBNAIL_STORAGE_FOLDER,
            );
            fileDeleteCount += 1;
          }
        }

        await this.mediaRepo.hardDelete(String(media._id));
        recordDeleteCount += 1;
      } catch {
        failedMediaIds.push(String(media._id));
      }
    }

    return {
      scannedCount: deletedMedia.length,
      fileDeleteCount,
      recordDeleteCount,
      failedMediaIds,
    };
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
      await this.refreshProfileScores(userId);

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

  private async refreshProfileScores(userId: string) {
    const [profile, imageCount, videoCount] = await Promise.all([
      this.profileModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .lean()
        .exec(),
      this.mediaRepo.countByUser(userId, MediaType.IMAGE),
      this.mediaRepo.countByUser(userId, MediaType.VIDEO),
    ]);

    if (!profile) return;

    const { missingFields: _missingFields, ...derived } =
      this.profileScoringService.calculate(profile, {
        imageCount,
        videoCount,
      });
    void _missingFields;

    await this.profileModel
      .updateOne(
        { userId: new Types.ObjectId(userId) },
        { $set: derived },
        { runValidators: true },
      )
      .exec();
    await this.cache.del(`profile:${userId}`);
  }

  private getStorageFolder(type: MediaType) {
    return type === MediaType.VIDEO
      ? VIDEO_STORAGE_FOLDER
      : IMAGE_STORAGE_FOLDER;
  }

  private extractFilename(url: string) {
    return url.split('?')[0]?.split('/').pop();
  }
}
