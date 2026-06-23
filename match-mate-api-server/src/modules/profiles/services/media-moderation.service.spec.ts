import { MediaType } from '@/common/enums';
import { MediaModerationService } from './media-moderation.service';
import { MediaModerationStatus } from '../enums/profile-media.enums';

describe('MediaModerationService', () => {
  const configService = {
    get: jest.fn(),
  };

  const file = (mimetype: string, size: number): Express.Multer.File =>
    ({
      mimetype,
      size,
      originalname: 'upload.bin',
      buffer: Buffer.from('file'),
    }) as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        'media.maxImageBytes': '100',
        'media.maxVideoBytes': '200',
        'media.aiModerationEnabled': 'true',
      };
      return values[key];
    });
  });

  it('approves valid media and records deterministic provider metadata', () => {
    const service = new MediaModerationService(configService as never);

    const result = service.moderate(file('image/jpeg', 80), MediaType.IMAGE);

    expect(result.status).toBe(MediaModerationStatus.APPROVED);
    expect(result.reasons).toEqual([]);
    expect(result.metadata).toMatchObject({
      provider: 'aws_rekognition',
      aiEnabled: true,
      mimeType: 'image/jpeg',
      size: 80,
    });
  });

  it('flags unsupported mime type and oversized files', () => {
    const service = new MediaModerationService(configService as never);

    const result = service.moderate(file('image/gif', 250), MediaType.VIDEO);

    expect(result.status).toBe(MediaModerationStatus.FLAGGED);
    expect(result.reasons).toEqual(['unsupported_mime_type', 'file_too_large']);
  });

  it('falls back to default limits when config values are invalid', () => {
    configService.get.mockReturnValue('not-a-number');
    const service = new MediaModerationService(configService as never);

    const result = service.moderate(
      file('image/png', 10 * 1024 * 1024 + 1),
      MediaType.IMAGE,
    );

    expect(result.status).toBe(MediaModerationStatus.FLAGGED);
    expect(result.reasons).toContain('file_too_large');
  });
});
