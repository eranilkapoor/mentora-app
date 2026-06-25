import { ErrorCode } from '@/common/constants';
import { MediaType } from '@/common/enums';
import { Types } from 'mongoose';
import { MediaService } from './media.service';

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

  const profileModel = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  const cache = {
    del: jest.fn(),
  };

  let service: MediaService;

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

    service = new MediaService(
      mediaRepo as never,
      storageService as never,
      profileScoringService as never,
      moderationService as never,
      videoThumbnailService as never,
      profileModel as never,
      cache as never,
    );
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

  it('rejects addImages when image limit is exceeded', async () => {
    mediaRepo.countByUser.mockResolvedValue(10);

    await expect(
      service.addImages({} as never, userId, [
        { originalname: 'new.jpg' },
      ] as Express.Multer.File[]),
    ).rejects.toMatchObject({ code: ErrorCode.PROFILE_IMAGE_LIMIT_EXCEEDED });
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
});
