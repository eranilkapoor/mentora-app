import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ChatPresenceService } from './chat-presence.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { NotificationService } from '../notification/notification.service';

const mockRepo = () => ({
  findMatchesForUser: jest.fn(),
  listRoomsForUser: jest.fn(),
  findUsersByIds: jest.fn(),
  findProfilesByUserIds: jest.fn(),
});

describe('ChatService', () => {
  let service: ChatService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ChatRepository, useValue: repo },
        { provide: ChatPresenceService, useValue: {} },
        { provide: ChatRealtimeService, useValue: {} },
        { provide: NotificationService, useValue: { notify: jest.fn() } },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => jest.clearAllMocks());

  it('health should return transport status', () => {
    const result = service.health();
    expect(result.status).toBe('ok');
    expect(result.transport).toBe('socket.io');
  });

  it('createOrGetDirectRoom should reject chat with self', async () => {
    const userId = '507f1f77bcf86cd799439011';

    await expect(
      service.createOrGetDirectRoom(userId, { targetUserId: userId } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('getContacts should return paged contacts response', async () => {
    repo.findMatchesForUser.mockResolvedValue([]);
    repo.listRoomsForUser.mockResolvedValue([]);
    repo.findUsersByIds.mockResolvedValue([]);
    repo.findProfilesByUserIds.mockResolvedValue([]);

    const result = await service.getContacts('507f1f77bcf86cd799439011', {
      page: 1,
      limit: 10,
    } as any);

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false,
    });
    expect(Array.isArray(result.items)).toBe(true);
  });
});
