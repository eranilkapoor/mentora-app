import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { AppLogger } from 'src/common/logger/logger.service';

describe('StorageService', () => {
  const buildConfig = (driver: 'local' | 's3') => ({
    getOrThrow: jest.fn((key: string) => {
      const cfg: Record<string, string> = {
        'storage.driver': driver,
        'storage.awsS3Bucket': 'bucket-1',
        'storage.awsS3BaseUrl': 'https://cdn.example.com',
        'storage.awsRegion': 'ap-south-1',
        'storage.awsAccessKeyId': 'key',
        'storage.awsSecretAccessKey': 'secret',
        'api.baseUrl': 'http://localhost:3000',
      };
      return cfg[key];
    }),
  });

  const logger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

  afterEach(() => jest.clearAllMocks());

  it('getUrl should return local upload URL when driver is local', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: buildConfig('local') },
        { provide: AppLogger, useValue: logger },
      ],
    }).compile();

    const service = module.get<StorageService>(StorageService);
    expect(service.getUrl('file.jpg', 'profiles')).toBe(
      'http://localhost:3000/uploads/profiles/file.jpg',
    );
  });

  it('getUrl should return S3 URL when driver is s3', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: buildConfig('s3') },
        { provide: AppLogger, useValue: logger },
      ],
    }).compile();

    const service = module.get<StorageService>(StorageService);
    expect(service.getUrl('file.jpg', 'profiles')).toBe(
      'https://cdn.example.com/profiles/file.jpg',
    );
  });

  it('uploadFiles should return empty array for empty input', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: buildConfig('local') },
        { provide: AppLogger, useValue: logger },
      ],
    }).compile();

    const service = module.get<StorageService>(StorageService);
    const result = await service.uploadFiles([], 'profiles');
    expect(result).toEqual([]);
  });
});
