import { execFile } from 'child_process';
import * as fs from 'fs';
import { VideoThumbnailService } from './video-thumbnail.service';

jest.mock('child_process', () => ({ execFile: jest.fn() }));
jest.mock('fs', () => ({
  promises: {
    mkdtemp: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    rm: jest.fn(),
  },
}));

describe('VideoThumbnailService', () => {
  const configService = { get: jest.fn() };
  const logger = { warn: jest.fn() };
  const mockedExecFile = execFile as unknown as jest.Mock;
  const promises = fs.promises as unknown as {
    mkdtemp: jest.Mock;
    writeFile: jest.Mock;
    readFile: jest.Mock;
    rm: jest.Mock;
  };
  const video = {
    originalname: 'intro.profile.mp4',
    encoding: '7bit',
    mimetype: 'video/mp4',
    size: 12,
    buffer: Buffer.from('video'),
  } as Express.Multer.File;
  let service: VideoThumbnailService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue('/usr/bin/ffmpeg');
    promises.mkdtemp.mockResolvedValue('/tmp/matchmate-video-test');
    promises.writeFile.mockResolvedValue(undefined);
    promises.readFile.mockResolvedValue(Buffer.from('thumbnail'));
    promises.rm.mockResolvedValue(undefined);
    mockedExecFile.mockImplementation((...args: unknown[]) => {
      const callback = args.at(-1) as (error: Error | null) => void;
      callback(null);
    });
    service = new VideoThumbnailService(
      configService as never,
      logger as never,
    );
  });

  it('skips thumbnail generation when ffmpeg is not configured', async () => {
    configService.get.mockReturnValue('');

    await expect(service.generateThumbnail(video)).resolves.toBeNull();

    expect(promises.mkdtemp).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('generates a JPEG thumbnail and cleans temporary files', async () => {
    const result = await service.generateThumbnail(video);

    expect(result).toMatchObject({
      fieldname: 'thumbnails',
      originalname: 'intro.profile-thumbnail.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: Buffer.byteLength('thumbnail'),
      buffer: Buffer.from('thumbnail'),
    });
    expect(mockedExecFile).toHaveBeenCalledWith(
      '/usr/bin/ffmpeg',
      expect.arrayContaining(['-i', expect.stringContaining('intro-')]),
      expect.any(Function),
    );
    expect(promises.rm).toHaveBeenCalledWith('/tmp/matchmate-video-test', {
      recursive: true,
      force: true,
    });
  });

  it.each([
    { failure: new Error('ffmpeg failed'), message: 'ffmpeg failed' },
    { failure: 'process stopped', message: 'process stopped' },
  ])(
    'logs $message failures and still cleans up',
    async ({ failure, message }) => {
      promises.writeFile.mockRejectedValueOnce(failure);

      await expect(service.generateThumbnail(video)).resolves.toBeNull();

      expect(logger.warn).toHaveBeenCalledWith(
        'Video thumbnail generation failed',
        { error: message },
      );
      expect(promises.rm).toHaveBeenCalledTimes(1);
    },
  );
});
