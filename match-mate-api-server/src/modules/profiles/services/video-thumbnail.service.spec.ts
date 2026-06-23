import { VideoThumbnailService } from './video-thumbnail.service';

describe('VideoThumbnailService', () => {
  const configService = {
    get: jest.fn(),
  };
  const logger = {
    warn: jest.fn(),
  };
  const video = {
    originalname: 'intro.mp4',
    encoding: '7bit',
    mimetype: 'video/mp4',
    size: 12,
    buffer: Buffer.from('video'),
  } as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips thumbnail generation when ffmpeg is not configured', async () => {
    configService.get.mockReturnValue('');
    const service = new VideoThumbnailService(
      configService as never,
      logger as never,
    );

    await expect(service.generateThumbnail(video)).resolves.toBeNull();

    expect(logger.warn).not.toHaveBeenCalled();
  });
});
