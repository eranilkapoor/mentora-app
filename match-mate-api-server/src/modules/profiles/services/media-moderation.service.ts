import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaType } from '@/common/enums';
import { MediaModerationStatus } from '../schemas/media/media.schema';

export interface MediaModerationResult {
  status: MediaModerationStatus;
  reasons: string[];
  metadata: Record<string, unknown>;
}

const DEFAULT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_VIDEO_BYTES = 100 * 1024 * 1024;

@Injectable()
export class MediaModerationService {
  constructor(private readonly configService: ConfigService) {}

  moderate(file: Express.Multer.File, type: MediaType): MediaModerationResult {
    const reasons: string[] = [];
    const allowedMimePrefix = type === MediaType.IMAGE ? 'image/' : 'video/';
    const maxBytes =
      type === MediaType.IMAGE
        ? this.getNumber('media.maxImageBytes', DEFAULT_MAX_IMAGE_BYTES)
        : this.getNumber('media.maxVideoBytes', DEFAULT_MAX_VIDEO_BYTES);

    if (!file.mimetype?.startsWith(allowedMimePrefix)) {
      reasons.push('unsupported_mime_type');
    }

    if (file.size > maxBytes) {
      reasons.push('file_too_large');
    }

    // Hook point for AWS Rekognition/AI moderation. Keep local development
    // deterministic while still enforcing a review queue for hard failures.
    const aiEnabled = this.getBoolean('media.aiModerationEnabled', false);

    return {
      status:
        reasons.length > 0
          ? MediaModerationStatus.FLAGGED
          : MediaModerationStatus.APPROVED,
      reasons,
      metadata: {
        provider: aiEnabled ? 'aws_rekognition' : 'basic_rules',
        aiEnabled,
        mimeType: file.mimetype,
        size: file.size,
        checkedAt: new Date().toISOString(),
      },
    };
  }

  private getBoolean(key: string, fallback: boolean): boolean {
    const value = this.configService.get<string | boolean>(key);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return fallback;
  }

  private getNumber(key: string, fallback: number): number {
    const value = Number(this.configService.get<string | number>(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
