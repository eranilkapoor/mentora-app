import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppLogger } from '@/common/logger/logger.service';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly isS3: boolean;
  private s3Client: S3Client | null = null;
  private readonly bucket: string;
  private readonly s3BaseUrl: string;
  private readonly apiBaseUrl: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.isS3 =
      this.configService.getOrThrow<string>('storage.driver') === 's3';
    this.bucket = this.configService.getOrThrow<string>('storage.awsS3Bucket');
    this.s3BaseUrl = this.normalizeBaseUrl(
      this.configService.getOrThrow<string>('storage.awsS3BaseUrl'),
    );
    this.apiBaseUrl = this.configService.getOrThrow<string>('api.baseUrl');
    this.publicBaseUrl = this.apiBaseUrl.replace(/\/api(?:\/v\d+)?\/?$/i, '');

    if (this.isS3) {
      const s3Config: S3ClientConfig = {
        region: this.configService.getOrThrow<string>('storage.awsRegion'),
      };
      const credentials = this.getExplicitS3Credentials();

      if (credentials) {
        s3Config.credentials = credentials;
      }

      this.s3Client = new S3Client(s3Config);
      this.logger.log('Storage driver: S3', {
        credentialsProvider: credentials
          ? 'environment'
          : 'aws-default-provider-chain',
      });
    } else {
      this.logger.log('Storage driver: Local');
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.isS3 || !this.s3Client) return;

    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log('S3 bucket access verified', { bucket: this.bucket });
    } catch (error) {
      this.logger.error('S3 bucket access verification failed', undefined, {
        bucket: this.bucket,
        region: this.configService.get<string>('storage.awsRegion'),
        error: this.toErrorMeta(error),
      });
      throw new AppException(
        ErrorCode.STORAGE_SERVICE_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
        null,
        undefined,
        {
          provider: 's3',
          operation: 'head_bucket',
          bucket: this.bucket,
        },
      );
    }
  }

  //  Upload Single File
  async uploadFile(
    file: Express.Multer.File,
    folder = 'student-media',
  ): Promise<{ filename: string; url: string }> {
    const ext = file.mimetype.split('/')[1] ?? 'jpg';
    const filename = `${uuidv4()}.${ext}`;

    if (this.isS3) {
      return this.uploadToS3(file, filename, folder);
    }

    return this.uploadToLocal(file, filename, folder);
  }

  //  Upload Multiple Files
  async uploadFiles(
    files: Express.Multer.File[],
    folder = 'student-media',
  ): Promise<{ filename: string; url: string }[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
  }

  //  Delete File
  async deleteFile(filename: string, folder = 'student-media'): Promise<void> {
    if (this.isS3) {
      await this.deleteFromS3(filename, folder);
    } else {
      await this.deleteFromLocal(filename, folder);
    }
  }

  //  Get Public URL from filename
  getUrl(filename: string, folder = 'student-media'): string {
    const key = this.buildKey(folder, filename);
    return `${this.publicBaseUrl}/uploads/${key}`;
  }

  getReadableUrl(url: string | undefined | null): string | undefined {
    const trimmedUrl = url?.trim();
    if (!trimmedUrl) return undefined;

    if (!this.isS3) {
      return trimmedUrl;
    }

    if (trimmedUrl.startsWith('/uploads/')) {
      return `${this.publicBaseUrl}${trimmedUrl}`;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);
      const parsedS3BaseUrl = new URL(this.s3BaseUrl);

      if (parsedUrl.origin === parsedS3BaseUrl.origin) {
        const key = this.normalizeKey(parsedUrl.pathname);
        return `${this.publicBaseUrl}/uploads/${key}`;
      }
    } catch {
      return trimmedUrl;
    }

    return trimmedUrl;
  }

  async getS3Object(key: string): Promise<{
    body: NodeJS.ReadableStream;
    contentType?: string;
    contentLength?: number;
    cacheControl?: string;
  }> {
    if (!this.isS3 || !this.s3Client) {
      throw new AppException(ErrorCode.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const normalizedKey = this.normalizeKey(key);

    try {
      const object = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: normalizedKey,
        }),
      );

      if (!object.Body || !('pipe' in object.Body)) {
        throw new AppException(
          ErrorCode.STORAGE_SERVICE_FAILED,
          HttpStatus.SERVICE_UNAVAILABLE,
          null,
          undefined,
          {
            provider: 's3',
            operation: 'get_object',
            bucket: this.bucket,
            key: normalizedKey,
            reason: 'unreadable_body',
          },
        );
      }

      return {
        body: object.Body as NodeJS.ReadableStream,
        contentType: object.ContentType,
        contentLength: object.ContentLength,
        cacheControl: object.CacheControl,
      };
    } catch (error) {
      if (error instanceof AppException) throw error;

      this.logger.error('S3 read failed', undefined, {
        bucket: this.bucket,
        key: normalizedKey,
        error: this.toErrorMeta(error),
      });

      if (this.isMissingS3Object(error)) {
        throw new AppException(
          ErrorCode.FILE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          null,
          undefined,
          {
            provider: 's3',
            operation: 'get_object',
            bucket: this.bucket,
            key: normalizedKey,
          },
        );
      }

      throw new AppException(
        ErrorCode.STORAGE_SERVICE_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
        null,
        undefined,
        {
          provider: 's3',
          operation: 'get_object',
          bucket: this.bucket,
          key: normalizedKey,
        },
      );
    }
  }

  //  S3 Internals
  private async uploadToS3(
    file: Express.Multer.File,
    filename: string,
    folder: string,
  ): Promise<{ filename: string; url: string }> {
    const key = this.buildKey(folder, filename);

    try {
      const upload = new Upload({
        client: this.s3Client!,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();
    } catch (error) {
      this.logger.error('S3 upload failed', undefined, {
        bucket: this.bucket,
        key,
        contentType: file.mimetype,
        size: file.size,
        error: this.toErrorMeta(error),
      });
      throw new AppException(
        ErrorCode.STORAGE_SERVICE_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
        null,
        undefined,
        {
          provider: 's3',
          operation: 'put_object',
          bucket: this.bucket,
          key,
        },
      );
    }

    const url = this.getUrl(filename, folder);
    this.logger.log(` Uploaded to S3: ${url}`);

    return { filename, url };
  }

  private async deleteFromS3(filename: string, folder: string): Promise<void> {
    if (!this.s3Client) return;
    const key = this.buildKey(folder, filename);

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error('S3 delete failed', undefined, {
        bucket: this.bucket,
        key,
        error: this.toErrorMeta(error),
      });
      throw new AppException(
        ErrorCode.STORAGE_SERVICE_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
        null,
        undefined,
        {
          provider: 's3',
          operation: 'delete_object',
          bucket: this.bucket,
          key,
        },
      );
    }

    this.logger.log(` Deleted from S3: ${key}`);
  }

  //  Local Internals
  private async uploadToLocal(
    file: Express.Multer.File,
    filename: string,
    folder: string,
  ): Promise<{ filename: string; url: string }> {
    const uploadDir = path.join(process.cwd(), 'uploads', folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);

    const url = `${this.publicBaseUrl}/uploads/${folder}/${filename}`;
    this.logger.log(` Saved locally: ${filePath}`);

    return { filename, url };
  }

  private async deleteFromLocal(
    filename: string,
    folder: string,
  ): Promise<void> {
    const filePath = path.join(process.cwd(), 'uploads', folder, filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      this.logger.log(` Deleted local file: ${filePath}`);
    }
  }

  private buildKey(folder: string, filename: string): string {
    return this.normalizeKey(`${folder}/${filename}`);
  }

  private normalizeKey(key: string): string {
    const normalizedKey = key
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/{2,}/g, '/');

    if (
      normalizedKey.includes('\0') ||
      normalizedKey.split('/').some((segment) => segment === '..')
    ) {
      throw new AppException(
        ErrorCode.INVALID_REQUEST,
        HttpStatus.BAD_REQUEST,
        null,
        undefined,
        { reason: 'invalid_storage_key' },
      );
    }

    return normalizedKey;
  }

  private normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, '');
  }

  private getExplicitS3Credentials():
    | { accessKeyId: string; secretAccessKey: string }
    | undefined {
    const accessKeyId = this.configService.get<string>(
      'storage.awsAccessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'storage.awsSecretAccessKey',
    );

    if (!accessKeyId || !secretAccessKey) {
      return undefined;
    }

    return { accessKeyId, secretAccessKey };
  }

  private toErrorMeta(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      const metadata =
        '$metadata' in error && typeof error.$metadata === 'object'
          ? error.$metadata
          : undefined;

      return {
        name: error.name,
        message: error.message,
        metadata,
      };
    }

    return { message: String(error) };
  }

  private isMissingS3Object(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const metadata =
      '$metadata' in error && typeof error.$metadata === 'object'
        ? (error.$metadata as { httpStatusCode?: number })
        : undefined;

    return (
      error.name === 'NoSuchKey' ||
      error.name === 'NotFound' ||
      metadata?.httpStatusCode === HttpStatus.NOT_FOUND
    );
  }
}
