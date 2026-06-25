import { SuccessCode } from '@/common/constants';
import { MediaController } from './media.controller';

describe('MediaController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;

  const mediaService = {
    getImages: jest.fn(),
    addImages: jest.fn(),
    setPrimaryImage: jest.fn(),
    removeImage: jest.fn(),
    getVideos: jest.fn(),
    addVideos: jest.fn(),
    setPrimaryVideo: jest.fn(),
    removeVideo: jest.fn(),
  };

  let controller: MediaController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MediaController(mediaService as never);
  });

  it('fetches media collections for current user', async () => {
    mediaService.getImages.mockResolvedValue([{ id: 'img-1' }]);
    mediaService.getVideos.mockResolvedValue([{ id: 'vid-1' }]);

    const images = await controller.getImages(req);
    const videos = await controller.getVideos(req);

    expect(mediaService.getImages).toHaveBeenCalledWith(userId);
    expect(mediaService.getVideos).toHaveBeenCalledWith(userId);
    expect(images.code).toBe(SuccessCode.PROFILE_IMAGE_FETCHED);
    expect(videos.code).toBe(SuccessCode.PROFILE_VIDEO_FETCHED);
  });

  it('uploads image files and returns created contract', async () => {
    const files = [{ originalname: 'img.jpg' }] as Express.Multer.File[];
    mediaService.addImages.mockResolvedValue([{ id: 'img-1' }]);

    const response = await controller.uploadImages(req, files);

    expect(mediaService.addImages).toHaveBeenCalledWith(req, userId, files);
    expect(response.code).toBe(SuccessCode.PROFILE_IMAGE_UPLOADED);
  });

  it('normalizes missing video or thumbnail arrays during upload', async () => {
    mediaService.addVideos.mockResolvedValue([{ id: 'vid-1' }]);

    await controller.uploadVideos(req, {});

    expect(mediaService.addVideos).toHaveBeenCalledWith(req, userId, [], []);
  });

  it('sets and removes video media for current user', async () => {
    mediaService.setPrimaryVideo.mockResolvedValue({ id: 'vid-1' });
    mediaService.removeVideo.mockResolvedValue({ success: true });

    const setPrimary = await controller.setPrimaryVideo(req, 'vid-1');
    const removed = await controller.removeVideo(req, 'vid-1');

    expect(mediaService.setPrimaryVideo).toHaveBeenCalledWith(
      req,
      userId,
      'vid-1',
    );
    expect(mediaService.removeVideo).toHaveBeenCalledWith(req, userId, 'vid-1');
    expect(setPrimary.code).toBe(SuccessCode.PROFILE_VIDEO_REORDERED);
    expect(removed.code).toBe(SuccessCode.PROFILE_VIDEO_DELETED);
  });
});
