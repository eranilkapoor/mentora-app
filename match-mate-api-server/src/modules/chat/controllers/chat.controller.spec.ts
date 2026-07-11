import { ChatController } from './chat.controller';
import { SuccessCode } from '@/common/constants';

describe('ChatController', () => {
  const userId = 'user-1';
  const roomId = 'room-1';
  const req = { user: { sub: userId } } as never;

  const service = {
    health: jest.fn(),
    getConversations: jest.fn(),
    getContacts: jest.fn(),
    createOrGetDirectRoom: jest.fn(),
    getConversationDetail: jest.fn(),
    getMessages: jest.fn(),
    respondToChatRequest: jest.fn(),
    sendMessage: jest.fn(),
    uploadAttachments: jest.fn(),
    deleteOwnMessage: jest.fn(),
    markRoomRead: jest.fn(),
    updateRoomSettings: jest.fn(),
  };

  let controller: ChatController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ChatController(service as never);
  });

  it('returns public health through the standard response envelope', () => {
    service.health.mockReturnValue({ status: 'ok' });

    const response = controller.health();

    expect(service.health).toHaveBeenCalledTimes(1);
    expect(response).toMatchObject({
      success: true,
      code: SuccessCode.SUCCESS,
      data: { status: 'ok' },
    });
  });

  it('delegates conversation and contact list APIs to ChatService', async () => {
    const query = { page: 1, limit: 20 } as never;
    service.getConversations.mockResolvedValue({ items: [] });
    service.getContacts.mockResolvedValue({ items: [] });

    const conversations = await controller.getConversations(req, query);
    const contacts = await controller.getContacts(req, query);

    expect(service.getConversations).toHaveBeenCalledWith(userId, query);
    expect(service.getContacts).toHaveBeenCalledWith(userId, query);
    expect(conversations.code).toBe(SuccessCode.CHAT_FETCHED);
    expect(contacts.code).toBe(SuccessCode.CHAT_FETCHED);
  });

  it('fetches conversation detail and paginated room messages', async () => {
    const query = { page: 2, limit: 30 } as never;
    service.getConversationDetail.mockResolvedValue({ id: roomId });
    service.getMessages.mockResolvedValue({ items: [] });

    const detail = await controller.getConversationDetail(req, roomId);
    const messages = await controller.getMessages(req, roomId, query);

    expect(service.getConversationDetail).toHaveBeenCalledWith(userId, roomId);
    expect(service.getMessages).toHaveBeenCalledWith(userId, roomId, query);
    expect(detail.code).toBe(SuccessCode.CHAT_FETCHED);
    expect(messages.code).toBe(SuccessCode.CHAT_FETCHED);
  });

  it('creates rooms, sends messages, and reads messages with route params merged', async () => {
    service.createOrGetDirectRoom.mockResolvedValue({ id: roomId });
    service.sendMessage.mockResolvedValue({ id: 'message-1' });
    service.markRoomRead.mockResolvedValue({ read: true });

    await controller.createOrGetDirectRoom(req, {
      targetUserId: 'user-2',
      initialMessage: 'Hello',
    });
    const message = await controller.sendMessage(req, roomId, {
      content: 'Hello',
    });
    const read = await controller.markRoomRead(req, roomId, {
      upToMessageId: 'message-1',
    });

    expect(service.createOrGetDirectRoom).toHaveBeenCalledWith(userId, {
      targetUserId: 'user-2',
      initialMessage: 'Hello',
    });
    expect(service.sendMessage).toHaveBeenCalledWith(userId, {
      roomId,
      content: 'Hello',
    });
    expect(service.markRoomRead).toHaveBeenCalledWith(userId, roomId, {
      upToMessageId: 'message-1',
    });
    expect(message.code).toBe(SuccessCode.CHAT_MESSAGE_SENT);
    expect(read.code).toBe(SuccessCode.CHAT_MESSAGE_READ);
  });

  it('handles attachment, delete, request response, and room settings APIs', async () => {
    const files = [{ originalname: 'photo.jpg' }] as Express.Multer.File[];
    service.uploadAttachments.mockResolvedValue([{ id: 'file-1' }]);
    service.deleteOwnMessage.mockResolvedValue({ deleted: true });
    service.respondToChatRequest.mockResolvedValue({ status: 'accepted' });
    service.updateRoomSettings.mockResolvedValue({ pinned: true });

    const upload = await controller.uploadAttachments(req, files);
    const deleted = await controller.deleteMessage(req, roomId, 'message-1');
    const request = await controller.respondToChatRequest(req, roomId, {
      action: 'ACCEPT',
    });
    const settings = await controller.updateRoomSettings(req, roomId, {
      pinned: true,
    });

    expect(service.uploadAttachments).toHaveBeenCalledWith(userId, files);
    expect(service.deleteOwnMessage).toHaveBeenCalledWith(
      userId,
      roomId,
      'message-1',
    );
    expect(service.respondToChatRequest).toHaveBeenCalledWith(
      userId,
      roomId,
      'ACCEPT',
    );
    expect(service.updateRoomSettings).toHaveBeenCalledWith(userId, roomId, {
      pinned: true,
    });
    expect(upload.code).toBe(SuccessCode.FILE_UPLOADED);
    expect(deleted.code).toBe(SuccessCode.CHAT_MESSAGE_DELETED);
    expect(request.code).toBe(SuccessCode.CHAT_FETCHED);
    expect(settings.code).toBe(SuccessCode.CHAT_FETCHED);
  });

  it('normalizes missing attachment files and missing request users', async () => {
    service.uploadAttachments.mockResolvedValue([]);
    service.getContacts.mockResolvedValue({ items: [] });

    await controller.uploadAttachments({ headers: {} } as never, undefined!);
    await controller.getContacts({ headers: {} } as never, {});

    expect(service.uploadAttachments).toHaveBeenCalledWith('', []);
    expect(service.getContacts).toHaveBeenCalledWith('', {});
  });
});
