import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppLogger } from 'src/common/logger/logger.service';

@Injectable()
export class StorageService {
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
    this.s3BaseUrl = this.configService.getOrThrow<string>(
      'storage.awsS3BaseUrl',
    );
    this.apiBaseUrl = this.configService.getOrThrow<string>('api.baseUrl');
    this.publicBaseUrl = this.apiBaseUrl.replace(/\/api(?:\/v\d+)?\/?$/i, '');

    if (this.isS3) {
      this.s3Client = new S3Client({
        region: this.configService.getOrThrow<string>('storage.awsRegion'),
        credentials: {
          accessKeyId: this.configService.getOrThrow<string>(
            'storage.awsAccessKeyId',
          ),
          secretAccessKey: this.configService.getOrThrow<string>(
            'storage.awsSecretAccessKey',
          ),
        },
      });
      this.logger.log(' Storage driver: S3');
    } else {
      this.logger.log(' Storage driver: Local');
    }
  }

  //  Upload Single File
  async uploadFile(
    file: Express.Multer.File,
    folder = 'profiles',
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
    folder = 'profiles',
  ): Promise<{ filename: string; url: string }[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
  }

  //  Delete File
  async deleteFile(filename: string, folder = 'profiles'): Promise<void> {
    if (this.isS3) {
      await this.deleteFromS3(filename, folder);
    } else {
      await this.deleteFromLocal(filename, folder);
    }
  }

  //  Get Public URL from filename
  getUrl(filename: string, folder = 'profiles'): string {
    if (this.isS3) {
      return `${this.s3BaseUrl}/${folder}/${filename}`;
    }
    return `${this.publicBaseUrl}/uploads/${folder}/${filename}`;
  }

  //  S3 Internals
  private async uploadToS3(
    file: Express.Multer.File,
    filename: string,
    folder: string,
  ): Promise<{ filename: string; url: string }> {
    const key = `${folder}/${filename}`;

    const upload = new Upload({
      client: this.s3Client!,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Remove ACL if your bucket doesn't allow public ACLs
        // ACL: 'public-read',
      },
    });

    await upload.done();

    const url = `${this.s3BaseUrl}/${key}`;
    this.logger.log(` Uploaded to S3: ${url}`);

    return { filename, url };
  }

  private async deleteFromS3(filename: string, folder: string): Promise<void> {
    if (!this.s3Client) return;

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: `${folder}/${filename}`,
      }),
    );

    this.logger.log(` Deleted from S3: ${folder}/${filename}`);
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
}
