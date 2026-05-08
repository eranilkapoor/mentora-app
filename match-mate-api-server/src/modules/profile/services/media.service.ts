import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { MediaRepository } from '../repositories/media.repository';
import { StorageService } from '../../storage/services/storage.service';
import type { ICacheService } from 'src/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/interfaces/cache.interface';
import { AppRequest } from 'src/common/interfaces/app-request.interface';
import { MediaType } from 'src/common/enums';

const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;
const IMAGE_STORAGE_FOLDER = 'profiles/images';
const VIDEO_STORAGE_FOLDER = 'profiles/videos';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepo: MediaRepository,
    private readonly storageService: StorageService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  // ─── Images ────────────────────────────────────────────────────────────────

  async addImages(
    _req: AppRequest,
    userId: string,
    files: Express.Multer.File[],
  ) {
    try {
      const currentCount = await this.mediaRepo.countByUser(
        userId,
        MediaType.IMAGE,
      );

      if (currentCount + files.length > MAX_IMAGES) {
        throw new BadRequestException(
          `Cannot exceed ${MAX_IMAGES} profile images. You currently have ${currentCount}.`,
        );
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
        isPrimary: !hasPrimary && index === 0,
      }));

      const result = await this.mediaRepo.create(userId, inputs);
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to upload images',
      );
    }
  }

  async getImages(userId: string) {
    try {
      return await this.mediaRepo.findAllByUser(userId, MediaType.IMAGE);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve images',
      );
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
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to set primary image',
      );
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
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to remove image',
      );
    }
  }

  // ─── Videos ────────────────────────────────────────────────────────────────

  async addVideos(
    _req: AppRequest,
    userId: string,
    files: Express.Multer.File[],
  ) {
    try {
      const currentCount = await this.mediaRepo.countByUser(
        userId,
        MediaType.VIDEO,
      );

      if (currentCount + files.length > MAX_VIDEOS) {
        throw new BadRequestException(
          `Cannot exceed ${MAX_VIDEOS} profile videos. You currently have ${currentCount}.`,
        );
      }

      const uploaded = await this.storageService.uploadFiles(
        files,
        VIDEO_STORAGE_FOLDER,
      );

      const hasPrimary = await this.mediaRepo.hasPrimary(
        userId,
        MediaType.VIDEO,
      );

      const inputs = uploaded.map((vid, index) => ({
        ...vid,
        type: MediaType.VIDEO,
        mimeType: files[index]?.mimetype,
        size: files[index]?.size,
        isPrimary: !hasPrimary && index === 0,
      }));

      const result = await this.mediaRepo.create(userId, inputs);
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to upload videos',
      );
    }
  }

  async getVideos(userId: string) {
    try {
      return await this.mediaRepo.findAllByUser(userId, MediaType.VIDEO);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve videos',
      );
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
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to set primary video',
      );
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

      await this.invalidateCache(userId);
      return { success: true };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to remove video',
      );
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async assertOwnership(userId: string, mediaId: string) {
    const media = await this.mediaRepo.findById(mediaId);

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (String(media.userId) !== userId) {
      throw new ForbiddenException('You do not own this media');
    }

    return media;
  }

  private async invalidateCache(userId: string) {
    await this.cache.del(`profile:${userId}`);
    await this.cache.del(`media:images:${userId}`);
    await this.cache.del(`media:videos:${userId}`);
  }
}
