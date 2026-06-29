/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { HttpStatus } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorCode } from '@/common/constants';
import { StorageService } from './storage.service';

const mockS3Send = jest.fn();
const mockUploadDone = jest.fn();
const mockWriteFile = jest.fn();
const mockUnlink = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  DeleteObjectCommand: jest.fn((input: unknown) => ({
    command: 'delete',
    input,
  })),
  GetObjectCommand: jest.fn((input: unknown) => ({
    command: 'get',
    input,
  })),
  HeadBucketCommand: jest.fn((input: unknown) => ({
    command: 'head',
    input,
  })),
}));

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn(),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    unlink: (...args: unknown[]) => mockUnlink(...args),
  },
}));

jest.mock('uuid', () => ({ v4: jest.fn(() => 'file-uuid') }));

const file = (mimetype = 'image/jpeg', size = 3): Express.Multer.File =>
  ({
    buffer: Buffer.from('abc'),
    mimetype,
    size,
    originalname: 'original.jpg',
  }) as Express.Multer.File;

const createConfig = (
  driver: 'local' | 's3',
  overrides: Record<string, string | undefined> = {},
) => {
  const values: Record<string, string | undefined> = {
    'storage.driver': driver,
    'storage.awsS3Bucket': 'matchmate-bucket',
    'storage.awsS3BaseUrl': 'https://matchmate-bucket.s3.amazonaws.com///',
    'storage.awsRegion': 'ap-south-1',
    'api.baseUrl': 'https://api.matchmate.test/api/v1',
    ...overrides,
  };

  return {
    getOrThrow: jest.fn((key: string) => {
      const value = values[key];
      if (value === undefined) throw new Error(`Missing config: ${key}`);
      return value;
    }),
    get: jest.fn((key: string) => values[key]),
  };
};

const createLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
});

const createService = (
  driver: 'local' | 's3',
  overrides: Record<string, string | undefined> = {},
) => {
  const config = createConfig(driver, overrides);
  const logger = createLogger();
  const service = new StorageService(config as never, logger as never);
  return { config, logger, service };
};

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockS3Send.mockReset();
    mockUploadDone.mockReset();
    mockWriteFile.mockReset();
    mockUnlink.mockReset();
    jest
      .mocked(S3Client)
      .mockImplementation(() => ({ send: mockS3Send }) as never);
    jest
      .mocked(Upload)
      .mockImplementation(() => ({ done: mockUploadDone }) as never);
    jest.mocked(fs.existsSync).mockReturnValue(false);
    mockWriteFile.mockResolvedValue(undefined);
    mockUnlink.mockResolvedValue(undefined);
    mockUploadDone.mockResolvedValue(undefined);
  });

  it('initializes local storage without an S3 client', async () => {
    const { logger, service } = createService('local');

    await service.onModuleInit();

    expect(S3Client).not.toHaveBeenCalled();
    expect(mockS3Send).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('Storage driver: Local');
  });

  it('initializes S3 with the AWS default provider chain', () => {
    const { logger } = createService('s3');

    expect(S3Client).toHaveBeenCalledWith({ region: 'ap-south-1' });
    expect(logger.log).toHaveBeenCalledWith('Storage driver: S3', {
      credentialsProvider: 'aws-default-provider-chain',
    });
  });

  it.each([
    { 'storage.awsAccessKeyId': 'access-key' },
    { 'storage.awsSecretAccessKey': 'secret-key' },
  ])('does not use incomplete explicit S3 credentials', (overrides) => {
    createService('s3', overrides);

    expect(S3Client).toHaveBeenCalledWith({ region: 'ap-south-1' });
  });

  it('uses explicit S3 credentials only when both values exist', () => {
    const { logger } = createService('s3', {
      'storage.awsAccessKeyId': 'access-key',
      'storage.awsSecretAccessKey': 'secret-key',
    });

    expect(S3Client).toHaveBeenCalledWith({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      },
    });
    expect(logger.log).toHaveBeenCalledWith('Storage driver: S3', {
      credentialsProvider: 'environment',
    });
  });

  it('verifies S3 bucket access during module initialization', async () => {
    mockS3Send.mockResolvedValue({});
    const { logger, service } = createService('s3');

    await service.onModuleInit();

    expect(HeadBucketCommand).toHaveBeenCalledWith({
      Bucket: 'matchmate-bucket',
    });
    expect(logger.log).toHaveBeenCalledWith('S3 bucket access verified', {
      bucket: 'matchmate-bucket',
    });
  });

  it.each([new Error('access denied'), 'provider unavailable'])(
    'maps S3 bucket verification failures',
    async (providerError) => {
      mockS3Send.mockRejectedValue(providerError);
      const { logger, service } = createService('s3');

      await expect(service.onModuleInit()).rejects.toMatchObject({
        code: ErrorCode.STORAGE_SERVICE_FAILED,
        status: HttpStatus.SERVICE_UNAVAILABLE,
      });
      expect(logger.error).toHaveBeenCalledWith(
        'S3 bucket access verification failed',
        undefined,
        expect.objectContaining({
          bucket: 'matchmate-bucket',
          error: expect.any(Object),
        }),
      );
    },
  );

  it('uploads a local file and creates its folder when missing', async () => {
    const { logger, service } = createService('local');

    const result = await service.uploadFile(file(), 'profiles/images');

    const expectedDirectory = path.join(
      process.cwd(),
      'uploads',
      'profiles/images',
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDirectory, {
      recursive: true,
    });
    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join(expectedDirectory, 'file-uuid.jpeg'),
      Buffer.from('abc'),
    );
    expect(result).toEqual({
      filename: 'file-uuid.jpeg',
      url: 'https://api.matchmate.test/uploads/profiles/images/file-uuid.jpeg',
    });
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Saved locally:'),
    );
  });

  it('uses a fallback extension and an existing local directory', async () => {
    jest.mocked(fs.existsSync).mockReturnValue(true);
    const { service } = createService('local');

    const result = await service.uploadFile(file('image'));

    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(result.filename).toBe('file-uuid.jpg');
  });

  it.each([undefined, []])(
    'returns no uploads for an empty list',
    async (files) => {
      const { service } = createService('local');

      await expect(service.uploadFiles(files as never)).resolves.toEqual([]);
    },
  );

  it('uploads multiple files through the single-file workflow', async () => {
    jest.mocked(fs.existsSync).mockReturnValue(true);
    const { service } = createService('local');

    const result = await service.uploadFiles(
      [file('image/png'), file('image/webp')],
      'gallery',
    );

    expect(result).toHaveLength(2);
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });

  it('uploads to S3 and returns the API proxy URL', async () => {
    const { logger, service } = createService('s3');

    const result = await service.uploadFile(file('video/mp4', 10), 'videos');

    expect(Upload).toHaveBeenCalledWith({
      client: expect.any(Object),
      params: {
        Bucket: 'matchmate-bucket',
        Key: 'videos/file-uuid.mp4',
        Body: Buffer.from('abc'),
        ContentType: 'video/mp4',
      },
    });
    expect(result.url).toBe(
      'https://api.matchmate.test/uploads/videos/file-uuid.mp4',
    );
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Uploaded to S3:'),
    );
  });

  it('maps S3 upload failures with provider context', async () => {
    const providerError = Object.assign(new Error('upload failed'), {
      $metadata: { httpStatusCode: 503 },
    });
    mockUploadDone.mockRejectedValue(providerError);
    const { logger, service } = createService('s3');

    await expect(service.uploadFile(file(), 'images')).rejects.toMatchObject({
      code: ErrorCode.STORAGE_SERVICE_FAILED,
    });
    expect(logger.error).toHaveBeenCalledWith(
      'S3 upload failed',
      undefined,
      expect.objectContaining({
        key: 'images/file-uuid.jpeg',
        contentType: 'image/jpeg',
        size: 3,
      }),
    );
  });

  it('deletes an existing local file and ignores a missing one', async () => {
    const { logger, service } = createService('local');
    jest.mocked(fs.existsSync).mockReturnValueOnce(true).mockReturnValue(false);

    await service.deleteFile('first.jpg', 'images');
    await service.deleteFile('missing.jpg', 'images');

    expect(mockUnlink).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Deleted local file:'),
    );
  });

  it('deletes an S3 object', async () => {
    mockS3Send.mockResolvedValue({});
    const { logger, service } = createService('s3');

    await service.deleteFile('photo.jpg', 'profiles//images');

    expect(DeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: 'matchmate-bucket',
      Key: 'profiles/images/photo.jpg',
    });
    expect(logger.log).toHaveBeenCalledWith(
      ' Deleted from S3: profiles/images/photo.jpg',
    );
  });

  it('returns safely when an S3 delete has no initialized client', async () => {
    const { service } = createService('s3');
    Object.defineProperty(service, 's3Client', { value: null });

    await expect(service.deleteFile('photo.jpg')).resolves.toBeUndefined();
  });

  it('maps S3 delete failures', async () => {
    mockS3Send.mockRejectedValue(new Error('delete failed'));
    const { logger, service } = createService('s3');

    await expect(service.deleteFile('photo.jpg')).rejects.toMatchObject({
      code: ErrorCode.STORAGE_SERVICE_FAILED,
    });
    expect(logger.error).toHaveBeenCalledWith(
      'S3 delete failed',
      undefined,
      expect.objectContaining({ key: 'profiles/photo.jpg' }),
    );
  });

  it('normalizes URL keys and rejects traversal or null-byte keys', () => {
    const { service } = createService('local');

    expect(service.getUrl('photo.jpg', '\\profiles///images')).toBe(
      'https://api.matchmate.test/uploads/profiles/images/photo.jpg',
    );
    expect(() => service.getUrl('../secret.txt')).toThrow();
    expect(() => service.getUrl('bad\0name.jpg')).toThrow();
  });

  it.each([undefined, null, '', '   '])(
    'returns undefined for an empty readable URL',
    (value) => {
      const { service } = createService('s3');
      expect(service.getReadableUrl(value)).toBeUndefined();
    },
  );

  it('keeps local readable URLs unchanged', () => {
    const { service } = createService('local');
    expect(service.getReadableUrl('  /uploads/photo.jpg  ')).toBe(
      '/uploads/photo.jpg',
    );
  });

  it('converts relative and direct S3 URLs to API proxy URLs', () => {
    const { service } = createService('s3');

    expect(service.getReadableUrl('/uploads/profiles/photo.jpg')).toBe(
      'https://api.matchmate.test/uploads/profiles/photo.jpg',
    );
    expect(
      service.getReadableUrl(
        'https://matchmate-bucket.s3.amazonaws.com/profiles//photo.jpg',
      ),
    ).toBe('https://api.matchmate.test/uploads/profiles/photo.jpg');
  });

  it.each(['not a url', 'https://cdn.example.com/photo.jpg'])(
    'keeps non-S3 readable URL %s unchanged',
    (url) => {
      const { service } = createService('s3');
      expect(service.getReadableUrl(url)).toBe(url);
    },
  );

  it('rejects S3 reads when S3 storage is unavailable', async () => {
    const { service } = createService('local');

    await expect(service.getS3Object('photo.jpg')).rejects.toMatchObject({
      code: ErrorCode.FILE_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('returns readable S3 object metadata', async () => {
    const body = { pipe: jest.fn() };
    mockS3Send.mockResolvedValue({
      Body: body,
      ContentType: 'image/jpeg',
      ContentLength: 123,
      CacheControl: 'public, max-age=60',
    });
    const { service } = createService('s3');

    await expect(service.getS3Object('/profiles//photo.jpg')).resolves.toEqual({
      body,
      contentType: 'image/jpeg',
      contentLength: 123,
      cacheControl: 'public, max-age=60',
    });
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: 'matchmate-bucket',
      Key: 'profiles/photo.jpg',
    });
  });

  it.each([undefined, {}, { transformToString: jest.fn() }])(
    'rejects unreadable S3 object bodies',
    async (Body) => {
      mockS3Send.mockResolvedValue({ Body });
      const { service } = createService('s3');

      await expect(service.getS3Object('photo.jpg')).rejects.toMatchObject({
        code: ErrorCode.STORAGE_SERVICE_FAILED,
      });
    },
  );

  it.each([
    Object.assign(new Error('missing'), { name: 'NoSuchKey' }),
    Object.assign(new Error('missing'), { name: 'NotFound' }),
    Object.assign(new Error('missing'), {
      $metadata: { httpStatusCode: HttpStatus.NOT_FOUND },
    }),
  ])('maps missing S3 objects to file-not-found', async (providerError) => {
    mockS3Send.mockRejectedValue(providerError);
    const { service } = createService('s3');

    await expect(service.getS3Object('photo.jpg')).rejects.toMatchObject({
      code: ErrorCode.FILE_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    });
  });

  it.each([
    new Error('provider failed'),
    Object.assign(new Error('provider failed'), { $metadata: 'invalid' }),
    'provider failed',
  ])(
    'maps other S3 read failures to storage failure',
    async (providerError) => {
      mockS3Send.mockRejectedValue(providerError);
      const { logger, service } = createService('s3');

      await expect(service.getS3Object('photo.jpg')).rejects.toMatchObject({
        code: ErrorCode.STORAGE_SERVICE_FAILED,
      });
      expect(logger.error).toHaveBeenCalledWith(
        'S3 read failed',
        undefined,
        expect.objectContaining({ key: 'photo.jpg' }),
      );
    },
  );
});
