import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    getRoot: jest.fn(() => ({
      message: 'Matrimony API is running 🚀',
      version: 'v1',
      timestamp: new Date().toISOString(),
    })),
    healthCheck: jest.fn(() => ({
      status: 'ok',
      uptime: 123,
      timestamp: new Date().toISOString(),
      env: 'test',
      memory: { rss: 1024, heapUsed: 512 },
    })),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getRoot()', () => {
    it('should return API info object', () => {
      const result = appController.getRoot();
      expect(result).toEqual(
        expect.objectContaining({ message: expect.any(String), version: 'v1' }),
      );
      expect(appService.getRoot).toHaveBeenCalledTimes(1);
    });
  });

  describe('check()', () => {
    it('should return health status object', () => {
      const result = appController.check();
      expect(result).toEqual(
        expect.objectContaining({ status: 'ok', uptime: expect.any(Number) }),
      );
      expect(appService.healthCheck).toHaveBeenCalledTimes(1);
    });
  });
});
