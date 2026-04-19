import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getRoot()', () => {
    it('should return message, version and timestamp', () => {
      const result = service.getRoot();
      expect(result.message).toBeDefined();
      expect(result.version).toBe('v1');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('healthCheck()', () => {
    it('should return status ok with uptime and memory info', () => {
      const result = service.healthCheck();
      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.env).toBe('test');
    });

    it('should call configService.get with "env"', () => {
      service.healthCheck();
      expect(mockConfigService.get).toHaveBeenCalledWith('env');
    });
  });
});
