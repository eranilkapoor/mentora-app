import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
import { AppLogger } from '@/common/logger/logger.service';

const execFileAsync = promisify(execFile);

@Injectable()
export class VideoThumbnailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async generateThumbnail(
    video: Express.Multer.File,
  ): Promise<Express.Multer.File | null> {
    const ffmpegPath = this.configService.get<string>('media.ffmpegPath');
    if (!ffmpegPath) return null;

    const tempDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'mentora-video-'),
    );
    const videoPath = path.join(tempDir, `intro-${Date.now()}.mp4`);
    const thumbnailPath = path.join(tempDir, `thumb-${Date.now()}.jpg`);

    try {
      await fs.promises.writeFile(videoPath, video.buffer);
      await execFileAsync(ffmpegPath, [
        '-y',
        '-i',
        videoPath,
        '-ss',
        '00:00:01',
        '-vframes',
        '1',
        '-q:v',
        '2',
        thumbnailPath,
      ]);

      const buffer = await fs.promises.readFile(thumbnailPath);
      return {
        fieldname: 'thumbnails',
        originalname: `${path.parse(video.originalname).name}-thumbnail.jpg`,
        encoding: video.encoding,
        mimetype: 'image/jpeg',
        size: buffer.length,
        buffer,
      } as Express.Multer.File;
    } catch (error) {
      this.logger.warn('Video thumbnail generation failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    } finally {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
  }
}
