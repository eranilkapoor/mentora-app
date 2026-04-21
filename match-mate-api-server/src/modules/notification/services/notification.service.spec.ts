import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { EmailNotificationProvider } from '../providers/email-notification.provider';
import { SmsNotificationProvider } from '../providers/sms-notification.provider';
import { PushNotificationProvider } from '../providers/push-notification.provider';
import { NotificationQueueService } from './notification-queue.service';
import { AppLogger } from 'src/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

const mockRepo = () => ({
  countUnread: jest.fn(),
  updateUserSettings: jest.fn(),
  listTemplates: jest.fn(),
  getDeliveryAnalytics: jest.fn(),
});

describe('NotificationService', () => {
  let service: NotificationService;
  let repo: ReturnType<typeof mockRepo>;
  let queue: {
    isEnabled: jest.Mock;
    getDeadLetter: jest.Mock;
    listDeadLetters: jest.Mock;
    replayDeadLetter: jest.Mock;
    replayDeadLettersBulk: jest.Mock;
    purgeDeadLetters: jest.Mock;
  };

  beforeEach(async () => {
    repo = mockRepo();
    queue = {
      isEnabled: jest.fn().mockReturnValue(true),
      getDeadLetter: jest.fn(),
      listDeadLetters: jest.fn(),
      replayDeadLetter: jest.fn(),
      replayDeadLettersBulk: jest.fn(),
      purgeDeadLetters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useValue: repo },
        { provide: EmailNotificationProvider, useValue: {} },
        { provide: SmsNotificationProvider, useValue: {} },
        { provide: PushNotificationProvider, useValue: {} },
        { provide: NotificationQueueService, useValue: queue },
        {
          provide: AppLogger,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getUnreadCount should delegate to repository', async () => {
    repo.countUnread.mockResolvedValue(5);
    const result = await service.getUnreadCount('user-1');
    expect(result).toBe(5);
    expect(repo.countUnread).toHaveBeenCalledWith('user-1');
  });

  it('updateSettings should map patch and delegate', async () => {
    repo.updateUserSettings.mockResolvedValue({ pushEnabled: false });

    const result = await service.updateSettings('user-1', {
      pushEnabled: false,
      doNotDisturb: true,
    } as any);

    expect(result).toEqual({ pushEnabled: false });
    expect(repo.updateUserSettings).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ pushEnabled: false, doNotDisturb: true }),
    );
  });

  it('listTemplates should pass includeInactive flag', async () => {
    repo.listTemplates.mockResolvedValue([{ key: 'WELCOME' }]);
    const result = await service.listTemplates(true);
    expect(result).toEqual([{ key: 'WELCOME' }]);
    expect(repo.listTemplates).toHaveBeenCalledWith(true);
  });

  it('getDeadLetterJob should throw when queue disabled', async () => {
    queue.isEnabled.mockReturnValue(false);
    await expect(service.getDeadLetterJob('job-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('getDeadLetterJob should throw when job not found', async () => {
    queue.isEnabled.mockReturnValue(true);
    queue.getDeadLetter.mockResolvedValue(null);
    await expect(service.getDeadLetterJob('job-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
