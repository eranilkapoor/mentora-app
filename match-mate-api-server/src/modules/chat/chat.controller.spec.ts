import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { buildReq } from 'src/test/helpers/mock-factory';

const mockChatService = () => ({
  health: jest.fn(),
  getConversations: jest.fn(),
  getContacts: jest.fn(),
  createOrGetDirectRoom: jest.fn(),
  getConversationDetail: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  markRoomRead: jest.fn(),
  updateRoomSettings: jest.fn(),
});

const USER_ID = 'user-id-1';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ReturnType<typeof mockChatService>;

  beforeEach(async () => {
    service = mockChatService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ChatController>(ChatController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('health()', () => {
    it('should return health status from service', () => {
      const health = {
        status: 'ok',
        transport: 'socket.io',
        timestamp: '2026-01-01T00:00:00Z',
      };
      service.health.mockReturnValue(health);
      const result = controller.health();
      expect(result).toEqual(health);
    });
  });

  describe('getConversations()', () => {
    it('should return paginated conversations', async () => {
      const data = { items: [], total: 0, page: 1 };
      service.getConversations.mockResolvedValue(data);
      const req = buildReq();

      const result = await controller.getConversations(req as any, {} as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(service.getConversations).toHaveBeenCalledWith(USER_ID, {});
    });
  });

  describe('getContacts()', () => {
    it('should return contacts', async () => {
      service.getContacts.mockResolvedValue({ contacts: [] });
      const result = await controller.getContacts(buildReq() as any, {} as any);
      expect(result.success).toBe(true);
    });
  });

  describe('createOrGetDirectRoom()', () => {
    it('should create or return existing direct room', async () => {
      const room = { roomId: 'room-1' };
      service.createOrGetDirectRoom.mockResolvedValue(room);

      const result = await controller.createOrGetDirectRoom(
        buildReq() as any,
        { targetUserId: 'target-1' } as any,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(room);
    });
  });

  describe('getConversationDetail()', () => {
    it('should return conversation detail', async () => {
      const detail = { roomId: 'room-1', lastMessage: null };
      service.getConversationDetail.mockResolvedValue(detail);

      const result = await controller.getConversationDetail(
        buildReq() as any,
        'room-1',
      );
      expect(result.success).toBe(true);
      expect(service.getConversationDetail).toHaveBeenCalledWith(
        USER_ID,
        'room-1',
      );
    });
  });

  describe('getMessages()', () => {
    it('should return paginated messages', async () => {
      service.getMessages.mockResolvedValue({ messages: [], total: 0 });
      const result = await controller.getMessages(
        buildReq() as any,
        'room-1',
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('sendMessage()', () => {
    it('should send message and return it', async () => {
      const message = { _id: 'msg-1', text: 'Hello' };
      service.sendMessage.mockResolvedValue(message);

      const result = await controller.sendMessage(buildReq() as any, 'room-1', {
        text: 'Hello',
      } as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(message);
      expect(service.sendMessage).toHaveBeenCalledWith(USER_ID, {
        text: 'Hello',
        roomId: 'room-1',
      });
    });
  });

  describe('markRoomRead()', () => {
    it('should mark room as read', async () => {
      service.markRoomRead.mockResolvedValue({ roomId: 'room-1' });
      const result = await controller.markRoomRead(
        buildReq() as any,
        'room-1',
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updateRoomSettings()', () => {
    it('should update room settings', async () => {
      service.updateRoomSettings.mockResolvedValue({
        roomId: 'room-1',
        settings: {},
      });
      const result = await controller.updateRoomSettings(
        buildReq() as any,
        'room-1',
        {} as any,
      );
      expect(result.success).toBe(true);
    });
  });
});
