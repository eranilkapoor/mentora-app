/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ErrorCode } from '@/common/constants';
import { MediaType } from '@/common/enums';
import { AppException } from '@/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { MediaService } from './media.service';
import { MediaModerationStatus } from '../enums/profile-media.enums';

describe('MediaService', () => {
  const userId = new Types.ObjectId().toString();

  const mediaRepo = {
    countByUser: jest.fn(),
    findAllByUser: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
    setPrimary: jest.fn(),
    findDeletedOlderThan: jest.fn(),
    hardDelete: jest.fn(),
    hasPrimary: jest.fn(),
    create: jest.fn(),
    getReviewQueue: jest.fn(),
    review: jest.fn(),
  };

  const storageService = {
    getReadableUrl: jest.fn(),
    deleteFile: jest.fn(),
    uploadFiles: jest.fn(),
  };

  const profileScoringService = {
    calculate: jest.fn(),
  };

  const moderationService = {
    moderate: jest.fn(),
  };

  const videoThumbnailService = {
    generateThumbnail: jest.fn(),
  };

  const featureService = {
    getFeaturesForUser: jest.fn(),
  };

  const profileModel = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  const cache = {
    del: jest.fn(),
  };

  let service: MediaService;

  const imageFile = {
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
    size: 123,
  } as Express.Multer.File;
  const videoFile = {
    originalname: 'intro.mp4',
    mimetype: 'video/mp4',
    size: 456,
  } as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();

    profileModel.findOne.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    profileModel.updateOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ acknowledged: true }),
    });

    mediaRepo.countByUser.mockResolvedValue(0);
    mediaRepo.hasPrimary.mockResolvedValue(false);
    featureService.getFeaturesForUser.mockResolvedValue({
      upload_photos: 10,
      upload_videos: 1,
    });
    const referralsService = { awardProfileCompletionReward: jest.fn() };
    moderationService.moderate.mockReturnValue({
      status: MediaModerationStatus.APPROVED,
      reasons: [],
      metadata: { source: 'test' },
    });

    service = new MediaService(
      mediaRepo as never,
      storageService as never,
      profileScoringService as never,
      moderationService as never,
      videoThumbnailService as never,
      featureService as never,
      referralsService as never,
      profileModel as never,
      cache as never,
    );
  });

  it('adds moderated images, assigns the requested primary, and refreshes caches', async () => {
    storageService.uploadFiles.mockResolvedValue([
      { url: 'profiles/images/photo.jpg', filename: 'photo.jpg' },
    ]);
    mediaRepo.create.mockResolvedValue([{ _id: 'img-1' }]);

    const result = await service.addImages({} as never, userId, [imageFile], 0);

    expect(moderationService.moderate).toHaveBeenCalledWith(
      imageFile,
      MediaType.IMAGE,
    );
    expect(mediaRepo.create).toHaveBeenCalledWith(userId, [
      expect.objectContaining({
        type: MediaType.IMAGE,
        isPrimary: true,
        moderationStatus: MediaModerationStatus.APPROVED,
      }),
    ]);
    expect(cache.del).toHaveBeenCalledTimes(3);
    expect(result).toEqual([{ _id: 'img-1' }]);
  });

  it('does not assign another primary image when one already exists', async () => {
    storageService.uploadFiles.mockResolvedValue([{ url: 'image.jpg' }]);
    mediaRepo.hasPrimary.mockResolvedValue(true);
    mediaRepo.create.mockResolvedValue([]);

    await service.addImages({} as never, userId, [imageFile], 0);

    expect(mediaRepo.create.mock.calls[0][1][0].isPrimary).toBe(false);
  });

  it('maps unexpected image upload failures to FILE_UPLOAD_FAILED', async () => {
    mediaRepo.countByUser.mockRejectedValue(new Error('database unavailable'));

    await expect(
      service.addImages({} as never, userId, [imageFile]),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_UPLOAD_FAILED });
  });

  it('maps media URLs to readable URLs in getImages', async () => {
    mediaRepo.findAllByUser.mockResolvedValue([
      {
        _id: 'img-1',
        url: 'profiles/images/raw.jpg',
        thumbnailUrl: 'profiles/images/thumb.jpg',
      },
    ]);
    storageService.getReadableUrl
      .mockReturnValueOnce('https://cdn.example.com/raw.jpg')
      .mockReturnValueOnce('https://cdn.example.com/thumb.jpg');

    const result = await service.getImages(userId);

    expect(mediaRepo.findAllByUser).toHaveBeenCalledWith(
      userId,
      MediaType.IMAGE,
    );
    expect(result).toEqual([
      {
        _id: 'img-1',
        url: 'https://cdn.example.com/raw.jpg',
        thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      },
    ]);
  });

  it('keeps original image URLs when readable URLs are unavailable', async () => {
    mediaRepo.findAllByUser.mockResolvedValue([
      { url: 'raw.jpg', thumbnailUrl: 'thumb.jpg' },
      { url: 'second.jpg' },
    ]);
    storageService.getReadableUrl.mockReturnValue(undefined);

    await expect(service.getImages(userId)).resolves.toEqual([
      { url: 'raw.jpg', thumbnailUrl: 'thumb.jpg' },
      { url: 'second.jpg' },
    ]);
  });

  it('maps unexpected image reads to PROFILE_IMAGE_NOT_FOUND', async () => {
    mediaRepo.findAllByUser.mockRejectedValue(new Error('read failed'));

    await expect(service.getImages(userId)).rejects.toMatchObject({
      code: ErrorCode.PROFILE_IMAGE_NOT_FOUND,
    });
  });

  it('preserves AppException failures from image reads', async () => {
    const error = new AppException(
      ErrorCode.ACCESS_DENIED,
      HttpStatus.FORBIDDEN,
    );
    mediaRepo.findAllByUser.mockRejectedValue(error);

    await expect(service.getImages(userId)).rejects.toBe(error);
  });

  it('rejects addImages when image limit is exceeded', async () => {
    mediaRepo.countByUser.mockResolvedValue(10);

    await expect(
      service.addImages({} as never, userId, [
        { originalname: 'new.jpg' },
      ] as Express.Multer.File[]),
    ).rejects.toMatchObject({ code: ErrorCode.PROFILE_IMAGE_LIMIT_EXCEEDED });
  });

  it('sets a primary image and recalculates a persisted profile score', async () => {
    mediaRepo.findById.mockResolvedValue({ _id: 'img-1', userId });
    mediaRepo.setPrimary.mockResolvedValue({ _id: 'img-1', isPrimary: true });
    profileModel.findOne.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({ _id: 'profile-1' }),
      }),
    });
    profileScoringService.calculate.mockReturnValue({
      profileQualityScore: 90,
      missingFields: ['bio'],
    });

    const result = await service.setPrimaryImage({} as never, userId, 'img-1');

    expect(profileModel.updateOne).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      { $set: { profileQualityScore: 90 } },
      { runValidators: true },
    );
    expect(cache.del).toHaveBeenCalledWith(`profile:${userId}`);
    expect(result).toEqual({ _id: 'img-1', isPrimary: true });
  });

  it('rejects missing and foreign-owned media', async () => {
    mediaRepo.findById.mockResolvedValueOnce(null).mockResolvedValueOnce({
      _id: 'img-2',
      userId: new Types.ObjectId().toString(),
    });

    await expect(
      service.setPrimaryImage({} as never, userId, 'missing'),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_NOT_FOUND });
    await expect(
      service.setPrimaryImage({} as never, userId, 'img-2'),
    ).rejects.toMatchObject({ code: ErrorCode.ACCESS_DENIED });
  });

  it('maps unexpected primary-image failures to PROFILE_IMAGE_NOT_FOUND', async () => {
    mediaRepo.findById.mockRejectedValue(new Error('read failed'));

    await expect(
      service.setPrimaryImage({} as never, userId, 'img-1'),
    ).rejects.toMatchObject({ code: ErrorCode.PROFILE_IMAGE_NOT_FOUND });
  });

  it('promotes next image when removing an existing primary image', async () => {
    mediaRepo.findById.mockResolvedValue({
      _id: 'media-1',
      userId,
      isPrimary: true,
      filename: 'primary.jpg',
    });
    mediaRepo.softDelete.mockResolvedValue({ _id: 'media-1' });
    mediaRepo.findAllByUser.mockResolvedValue([{ _id: 'media-2' }]);
    mediaRepo.setPrimary.mockResolvedValue({ _id: 'media-2', isPrimary: true });

    const result = await service.removeImage({} as never, userId, 'media-1');

    expect(storageService.deleteFile).toHaveBeenCalledWith(
      'primary.jpg',
      'profiles/images',
    );
    expect(mediaRepo.setPrimary).toHaveBeenCalledWith(
      userId,
      'media-2',
      MediaType.IMAGE,
    );
    expect(result).toEqual({ success: true });
  });

  it('removes a non-primary image without deleting a missing file', async () => {
    mediaRepo.findById.mockResolvedValue({
      _id: 'media-1',
      userId,
      isPrimary: false,
    });

    await service.removeImage({} as never, userId, 'media-1');

    expect(storageService.deleteFile).not.toHaveBeenCalled();
    expect(mediaRepo.findAllByUser).not.toHaveBeenCalled();
  });

  it('does not promote an image when no eligible replacement remains', async () => {
    mediaRepo.findById.mockResolvedValue({
      _id: 'media-1',
      userId,
      isPrimary: true,
    });
    mediaRepo.findAllByUser
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{}]);

    await service.removeImage({} as never, userId, 'media-1');
    await service.removeImage({} as never, userId, 'media-1');

    expect(mediaRepo.setPrimary).not.toHaveBeenCalled();
  });

  it('maps unexpected image removal failures to FILE_UPLOAD_FAILED', async () => {
    mediaRepo.findById.mockRejectedValue(new Error('read failed'));

    await expect(
      service.removeImage({} as never, userId, 'img-1'),
    ).rejects.toMatchObject({
      code: ErrorCode.FILE_UPLOAD_FAILED,
      meta: { reason: 'failed_to_remove_image' },
    });
  });

  it('preserves ownership AppExceptions while removing an image', async () => {
    mediaRepo.findById.mockResolvedValue(null);

    await expect(
      service.removeImage({} as never, userId, 'missing'),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_NOT_FOUND });
  });

  it('adds a video with a supplied thumbnail and media metadata', async () => {
    storageService.uploadFiles
      .mockResolvedValueOnce([{ url: 'video.mp4', filename: 'video.mp4' }])
      .mockResolvedValueOnce([{ url: 'thumb.jpg' }]);
    mediaRepo.create.mockResolvedValue([{ _id: 'video-1' }]);

    const result = await service.addVideos(
      {} as never,
      userId,
      [videoFile],
      [imageFile],
    );

    expect(videoThumbnailService.generateThumbnail).not.toHaveBeenCalled();
    expect(mediaRepo.create).toHaveBeenCalledWith(userId, [
      expect.objectContaining({
        type: MediaType.VIDEO,
        thumbnailUrl: 'thumb.jpg',
        mimeType: 'video/mp4',
        size: 456,
        isPrimary: true,
      }),
    ]);
    expect(result).toEqual([{ _id: 'video-1' }]);
  });

  it('generates available thumbnails and respects an existing primary video', async () => {
    videoThumbnailService.generateThumbnail.mockResolvedValue(null);
    storageService.uploadFiles
      .mockResolvedValueOnce([{ url: 'video.mp4' }])
      .mockResolvedValueOnce([]);
    mediaRepo.hasPrimary.mockResolvedValue(true);
    mediaRepo.create.mockResolvedValue([]);

    await service.addVideos({} as never, userId, [videoFile]);

    expect(videoThumbnailService.generateThumbnail).toHaveBeenCalledWith(
      videoFile,
    );
    expect(mediaRepo.create.mock.calls[0][1][0]).toEqual(
      expect.objectContaining({ isPrimary: false, thumbnailUrl: undefined }),
    );
  });

  it('rejects videos over the limit and maps unexpected upload failures', async () => {
    mediaRepo.countByUser
      .mockResolvedValueOnce(1)
      .mockRejectedValueOnce(new Error('database unavailable'));

    await expect(
      service.addVideos({} as never, userId, [videoFile]),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_TOO_LARGE });
    await expect(
      service.addVideos({} as never, userId, [videoFile]),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_UPLOAD_FAILED });
  });

  it('returns videos with readable URLs and maps read failures', async () => {
    mediaRepo.findAllByUser.mockResolvedValueOnce([{ url: 'video.mp4' }]);
    storageService.getReadableUrl.mockReturnValue('https://cdn/video.mp4');

    await expect(service.getVideos(userId)).resolves.toEqual([
      { url: 'https://cdn/video.mp4' },
    ]);
    mediaRepo.findAllByUser.mockRejectedValueOnce(new Error('read failed'));
    await expect(service.getVideos(userId)).rejects.toMatchObject({
      code: ErrorCode.FILE_NOT_FOUND,
    });
  });

  it('preserves AppException failures from video reads', async () => {
    const error = new AppException(
      ErrorCode.ACCESS_DENIED,
      HttpStatus.FORBIDDEN,
    );
    mediaRepo.findAllByUser.mockRejectedValue(error);

    await expect(service.getVideos(userId)).rejects.toBe(error);
  });

  it('sets a primary video and maps unexpected failures', async () => {
    mediaRepo.findById.mockResolvedValueOnce({ _id: 'video-1', userId });
    mediaRepo.setPrimary.mockResolvedValue({ _id: 'video-1', isPrimary: true });

    await expect(
      service.setPrimaryVideo({} as never, userId, 'video-1'),
    ).resolves.toEqual({ _id: 'video-1', isPrimary: true });

    mediaRepo.findById.mockRejectedValueOnce(new Error('read failed'));
    await expect(
      service.setPrimaryVideo({} as never, userId, 'video-1'),
    ).rejects.toMatchObject({
      code: ErrorCode.FILE_NOT_FOUND,
      meta: { reason: 'failed_to_set_primary_video' },
    });
  });

  it('preserves ownership AppExceptions while setting a primary video', async () => {
    mediaRepo.findById.mockResolvedValue(null);

    await expect(
      service.setPrimaryVideo({} as never, userId, 'missing'),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_NOT_FOUND });
  });

  it('delegates review queue reads and refreshes reviewed owners', async () => {
    mediaRepo.getReviewQueue.mockResolvedValue([{ _id: 'media-1' }]);
    mediaRepo.review
      .mockResolvedValueOnce({ _id: 'media-1', userId })
      .mockResolvedValueOnce(null);

    await expect(service.getReviewQueue(25)).resolves.toEqual([
      { _id: 'media-1' },
    ]);
    await service.reviewMedia('reviewer-1', 'media-1', true, 'approved');
    const cacheCalls = cache.del.mock.calls.length;
    await service.reviewMedia('reviewer-1', 'missing', false);

    expect(mediaRepo.review).toHaveBeenNthCalledWith(
      1,
      'media-1',
      'reviewer-1',
      true,
      'approved',
    );
    expect(cache.del).toHaveBeenCalledTimes(cacheCalls);
  });

  it('returns cleanup stats and records failed deletes in cleanupDeletedMedia', async () => {
    mediaRepo.findDeletedOlderThan.mockResolvedValue([
      {
        _id: 'm1',
        type: MediaType.VIDEO,
        filename: 'video.mp4',
        thumbnailUrl: 'https://cdn.example.com/thumb-1.jpg?sig=abc',
      },
      {
        _id: 'm2',
        type: MediaType.IMAGE,
        filename: 'image.jpg',
      },
    ]);

    storageService.deleteFile
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('delete failed'));

    mediaRepo.hardDelete.mockResolvedValueOnce({ _id: 'm1' });

    const result = await service.cleanupDeletedMedia(7, 10);

    expect(mediaRepo.hardDelete).toHaveBeenCalledWith('m1');
    expect(result).toEqual({
      scannedCount: 2,
      fileDeleteCount: 2,
      recordDeleteCount: 1,
      failedMediaIds: ['m2'],
    });
  });

  it('clamps cleanup inputs and handles records without physical files', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T00:00:00.000Z'));
    mediaRepo.findDeletedOlderThan.mockResolvedValue([
      { _id: 'm1', type: MediaType.IMAGE, thumbnailUrl: '/' },
      { _id: 'm2', type: MediaType.IMAGE },
    ]);
    mediaRepo.hardDelete.mockResolvedValue({ _id: 'deleted' });

    const result = await service.cleanupDeletedMedia(-2, 900);

    expect(mediaRepo.findDeletedOlderThan).toHaveBeenCalledWith(
      new Date('2026-06-30T00:00:00.000Z'),
      500,
    );
    expect(storageService.deleteFile).not.toHaveBeenCalled();
    expect(result.recordDeleteCount).toBe(2);
    jest.useRealTimers();
  });

  it('uses cleanup defaults and clamps the lower record limit', async () => {
    mediaRepo.findDeletedOlderThan.mockResolvedValue([]);

    await service.cleanupDeletedMedia();
    await service.cleanupDeletedMedia(1, 0);

    expect(mediaRepo.findDeletedOlderThan.mock.calls[0][1]).toBe(100);
    expect(mediaRepo.findDeletedOlderThan.mock.calls[1][1]).toBe(1);
  });

  it('removes video files and thumbnails', async () => {
    mediaRepo.findById.mockResolvedValue({
      _id: 'video-1',
      userId,
      filename: 'video.mp4',
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
    });

    await expect(
      service.removeVideo({} as never, userId, 'video-1'),
    ).resolves.toEqual({ success: true });
    expect(storageService.deleteFile).toHaveBeenNthCalledWith(
      1,
      'video.mp4',
      'profiles/videos',
    );
    expect(storageService.deleteFile).toHaveBeenNthCalledWith(
      2,
      'thumb.jpg',
      'profiles/video-thumbnails',
    );
  });

  it('removes a video record without missing files and maps failures', async () => {
    mediaRepo.findById
      .mockResolvedValueOnce({ _id: 'video-1', userId })
      .mockResolvedValueOnce({
        _id: 'video-2',
        userId,
        thumbnailUrl: '/',
      });
    await service.removeVideo({} as never, userId, 'video-1');
    await service.removeVideo({} as never, userId, 'video-2');
    expect(storageService.deleteFile).not.toHaveBeenCalled();

    mediaRepo.findById.mockRejectedValueOnce(new Error('read failed'));
    await expect(
      service.removeVideo({} as never, userId, 'video-1'),
    ).rejects.toMatchObject({
      code: ErrorCode.FILE_UPLOAD_FAILED,
      meta: { reason: 'failed_to_remove_video' },
    });
  });

  it('preserves ownership AppExceptions while removing a video', async () => {
    mediaRepo.findById.mockResolvedValue(null);

    await expect(
      service.removeVideo({} as never, userId, 'missing'),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_NOT_FOUND });
  });
});
