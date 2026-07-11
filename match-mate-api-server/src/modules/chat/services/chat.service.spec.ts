/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';
import {
  ChatMessageStatus,
  ChatMessageType,
  ChatModerationStatus,
  ChatRoomStatus,
  ChatRoomType,
} from '../enums/chat.enums';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const repo = {
    countUnreadByRoomIds: jest.fn(),
    createDirectRoom: jest.fn(),
    createMessage: jest.fn(),
    findActiveMatchBetween: jest.fn(),
    findDirectRoomByUsers: jest.fn(),
    findMatchesForUser: jest.fn(),
    findMessageById: jest.fn(),
    findMessagesByIds: jest.fn(),
    findPrimaryImageMediaByUserIds: jest.fn(),
    findProfilesByUserIds: jest.fn(),
    findUsersByIds: jest.fn(),
    getBlockedRelationUserIds: jest.fn(),
    listMessages: jest.fn(),
    listModerationQueue: jest.fn(),
    listRoomsForUser: jest.fn(),
    markRoomDelivered: jest.fn(),
    markRoomRead: jest.fn(),
    respondToChatRequest: jest.fn(),
    reviewMessage: jest.fn(),
    saveRoom: jest.fn(),
    setRoomRequestMessage: jest.fn(),
    softDeleteMessageForEveryone: jest.fn(),
  };
  const presence = {
    isOnline: jest.fn(),
    getLastSeen: jest.fn(),
  };
  const realtime = {
    emitToConversation: jest.fn(),
    emitToUser: jest.fn(),
  };
  const access = {
    ensureValidObjectId: jest.fn(),
    ensureUsersExist: jest.fn(),
    ensureMessagingAllowed: jest.fn(),
    getAuthorizedRoom: jest.fn(),
  };
  const notificationsService = { notify: jest.fn() };
  const logger = { warn: jest.fn() };
  const storageService = { uploadFiles: jest.fn() };
  const configService = { get: jest.fn() };

  let service: ChatService;
  let userId: string;
  let partnerId: string;
  let roomId: string;
  let messageId: string;

  const createRoom = (status = ChatRoomStatus.ACTIVE): any => ({
    _id: new Types.ObjectId(roomId),
    id: roomId,
    roomType: ChatRoomType.DIRECT,
    status,
    participants: [new Types.ObjectId(userId), new Types.ObjectId(partnerId)],
    participantStates: [
      { userId: new Types.ObjectId(userId), unreadCount: 2 },
      { userId: new Types.ObjectId(partnerId), unreadCount: 0 },
    ],
    messageCount: 0,
    save: jest.fn(),
  });

  const createMessage = (overrides: Record<string, unknown> = {}) => ({
    _id: new Types.ObjectId(messageId),
    roomId: new Types.ObjectId(roomId),
    senderId: new Types.ObjectId(userId),
    receiverId: new Types.ObjectId(partnerId),
    type: ChatMessageType.TEXT,
    content: 'Hello',
    attachments: [],
    status: ChatMessageStatus.SENT,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new Types.ObjectId().toString();
    partnerId = new Types.ObjectId().toString();
    roomId = new Types.ObjectId().toString();
    messageId = new Types.ObjectId().toString();
    configService.get.mockImplementation(
      (key: string, fallback?: unknown) => fallback,
    );
    presence.isOnline.mockReturnValue(false);
    presence.getLastSeen.mockReturnValue(null);
    notificationsService.notify.mockResolvedValue(undefined);
    repo.findUsersByIds.mockResolvedValue([]);
    repo.findProfilesByUserIds.mockResolvedValue([]);
    repo.findPrimaryImageMediaByUserIds.mockResolvedValue([]);
    repo.findMessagesByIds.mockResolvedValue([]);
    repo.countUnreadByRoomIds.mockResolvedValue([]);
    repo.getBlockedRelationUserIds.mockResolvedValue([]);
    repo.saveRoom.mockResolvedValue(undefined);

    service = new ChatService(
      repo as never,
      presence as never,
      realtime as never,
      access as never,
      notificationsService as never,
      logger as never,
      storageService as never,
      configService as never,
    );
  });

  it('reports transport health', () => {
    expect(service.health()).toMatchObject({
      status: 'ok',
      transport: 'socket.io',
    });
  });

  it('creates pending requests and handles existing direct rooms', async () => {
    await expect(
      service.createOrGetDirectRoom(userId, { targetUserId: userId }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });

    const pendingRoom = createRoom(ChatRoomStatus.PENDING);
    repo.findDirectRoomByUsers.mockResolvedValue(null);
    repo.findActiveMatchBetween.mockResolvedValue(null);
    repo.createDirectRoom.mockResolvedValue(pendingRoom);
    const createRoomMessageSpy = jest
      .spyOn(service as any, 'createRoomMessage')
      .mockResolvedValue({ id: messageId });
    jest
      .spyOn(service as any, 'emitConversationUpdates')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'notifyChatRequest')
      .mockResolvedValue(undefined);
    const getConversationDetailSpy = jest
      .spyOn(service, 'getConversationDetail')
      .mockResolvedValue({ roomId } as never);

    await expect(
      service.createOrGetDirectRoom(userId, {
        targetUserId: partnerId,
        initialMessage: '  Hello  ',
      }),
    ).resolves.toEqual({ roomId });
    expect(createRoomMessageSpy).toHaveBeenCalledWith(
      pendingRoom,
      userId,
      expect.objectContaining({ content: 'Hello' }),
    );
    expect(repo.setRoomRequestMessage).toHaveBeenCalledWith(roomId, messageId);

    pendingRoom.messageCount = 1;
    repo.findDirectRoomByUsers.mockResolvedValue(pendingRoom);
    await service.createOrGetDirectRoom(userId, { targetUserId: partnerId });
    expect(getConversationDetailSpy).toHaveBeenCalled();

    const defaultRequestRoom = createRoom(ChatRoomStatus.PENDING);
    repo.findDirectRoomByUsers.mockResolvedValue(defaultRequestRoom);
    await service.createOrGetDirectRoom(userId, { targetUserId: partnerId });
    expect(createRoomMessageSpy).toHaveBeenLastCalledWith(
      defaultRequestRoom,
      userId,
      expect.objectContaining({
        content: "Hi, I'd like to connect and chat with you.",
      }),
    );

    const activeRoom = createRoom();
    repo.findDirectRoomByUsers.mockResolvedValue(activeRoom);
    jest
      .spyOn(service, 'sendMessage')
      .mockResolvedValue({ sent: true } as never);
    await expect(
      service.createOrGetDirectRoom(userId, {
        targetUserId: partnerId,
        initialMessage: 'Hi',
      }),
    ).resolves.toEqual({ sent: true });

    await service.createOrGetDirectRoom(userId, { targetUserId: partnerId });
    expect(getConversationDetailSpy).toHaveBeenCalledWith(userId, roomId);
  });

  it('creates matched rooms and rejects an invalid repository result', async () => {
    repo.findDirectRoomByUsers.mockResolvedValue(null);
    repo.findActiveMatchBetween.mockResolvedValue({
      _id: new Types.ObjectId(),
    });
    repo.createDirectRoom.mockResolvedValue({});
    await expect(
      service.createOrGetDirectRoom(userId, { targetUserId: partnerId }),
    ).rejects.toMatchObject({ code: ErrorCode.INTERNAL_ERROR });
    expect(repo.createDirectRoom).toHaveBeenCalledWith(
      expect.objectContaining({ status: ChatRoomStatus.ACTIVE }),
    );
  });

  it('lists messages, emits delivery, and calculates cursors', async () => {
    access.getAuthorizedRoom.mockResolvedValue(createRoom());
    repo.listMessages.mockResolvedValue([createMessage()]);
    repo.markRoomDelivered.mockResolvedValue({ modifiedCount: 1 });
    await expect(
      service.getMessages(userId, roomId, { limit: 1 }),
    ).resolves.toMatchObject({
      roomId,
      nextCursor: messageId,
      items: [expect.objectContaining({ id: messageId })],
    });
    expect(realtime.emitToConversation).toHaveBeenCalledWith(
      roomId,
      'message:delivered',
      expect.any(Object),
    );

    repo.listMessages.mockResolvedValue([]);
    repo.markRoomDelivered.mockResolvedValue({});
    await expect(
      service.getMessages(userId, roomId, {}),
    ).resolves.toMatchObject({
      nextCursor: null,
    });
  });

  it('aggregates, filters, sorts, and paginates conversations', async () => {
    const secondPartnerId = new Types.ObjectId().toString();
    const first = {
      ...createRoom(),
      lastMessageId: new Types.ObjectId(messageId),
      lastMessageText: 'Welcome Asha',
      lastMessageSenderId: new Types.ObjectId(partnerId),
      lastMessageAt: new Date('2026-02-02'),
      lastActivityAt: new Date('2026-02-02'),
    };
    first.participantStates[0] = {
      ...first.participantStates[0],
      archivedAt: new Date(),
      pinnedAt: new Date(),
      mutedUntil: new Date('2027-01-01'),
      lastReadAt: new Date(),
    };
    const second = {
      ...createRoom(),
      _id: new Types.ObjectId(),
      id: new Types.ObjectId().toString(),
      participants: [
        new Types.ObjectId(userId),
        new Types.ObjectId(secondPartnerId),
      ],
      participantStates: [
        { userId: new Types.ObjectId(userId), unreadCount: 0 },
        { userId: new Types.ObjectId(secondPartnerId), unreadCount: 0 },
      ],
      lastActivityAt: new Date('2026-01-01'),
    };
    repo.listRoomsForUser.mockResolvedValue([second, first]);
    repo.countUnreadByRoomIds.mockResolvedValue([
      { _id: first._id, count: 3 },
      { _id: second._id, count: 0 },
    ]);
    repo.findUsersByIds.mockResolvedValue([
      { _id: new Types.ObjectId(partnerId), membership: { tier: 'gold' } },
      {
        _id: new Types.ObjectId(secondPartnerId),
        membership: { tier: 'free' },
      },
    ]);
    repo.findProfilesByUserIds.mockResolvedValue([
      {
        userId: new Types.ObjectId(partnerId),
        personal: {
          firstName: 'Asha',
          lastName: 'Rao',
          city: 'Pune',
          country: 'India',
        },
        verificationStatus: VerificationStatus.APPROVED,
      },
      {
        userId: new Types.ObjectId(secondPartnerId),
        personal: { firstName: 'Ravi' },
        verificationStatus: VerificationStatus.NOT_STARTED,
      },
    ]);
    repo.findPrimaryImageMediaByUserIds.mockResolvedValue([
      { userId: new Types.ObjectId(partnerId), thumbnailUrl: 'thumb' },
    ]);
    repo.findMessagesByIds.mockResolvedValue([
      createMessage({ deliveredAt: new Date(), readAt: new Date() }),
    ]);
    presence.isOnline.mockImplementation((id: string) => id === partnerId);

    await expect(
      service.getConversations(userId, {
        includeArchived: true,
        onlyUnread: true,
        onlyArchived: true,
        onlyPinned: true,
        onlyMuted: true,
        onlyOnline: true,
        search: 'asha',
        page: 1,
        limit: 1,
      }),
    ).resolves.toMatchObject({
      total: 1,
      unreadTotal: 3,
      items: [
        expect.objectContaining({
          roomId,
          participant: expect.objectContaining({ fullName: 'Asha Rao' }),
        }),
      ],
    });

    first.participantStates[0].archivedAt = undefined;
    repo.getBlockedRelationUserIds.mockResolvedValue([]);
    repo.countUnreadByRoomIds.mockResolvedValue([{ _id: first._id, count: 3 }]);
    repo.listRoomsForUser.mockResolvedValue([first, second]);
    await service.getConversations(userId, {});
    repo.listRoomsForUser.mockResolvedValue([second, first]);
    await service.getConversations(userId, {});
    first.participantStates[0].pinnedAt = undefined;
    first.lastActivityAt = undefined;
    second.lastActivityAt = undefined;
    await service.getConversations(userId, {});

    repo.getBlockedRelationUserIds.mockResolvedValue([partnerId]);
    await expect(service.getConversations(userId, {})).resolves.toMatchObject({
      total: 1,
      items: [
        expect.objectContaining({
          participant: expect.objectContaining({ userId: secondPartnerId }),
        }),
      ],
    });
  });

  it('builds contacts from legacy/current matches and existing rooms', async () => {
    const thirdId = new Types.ObjectId().toString();
    repo.findMatchesForUser.mockResolvedValue([
      { users: [new Types.ObjectId(userId), new Types.ObjectId(partnerId)] },
      {
        userId: new Types.ObjectId(userId),
        targetUserId: new Types.ObjectId(thirdId),
      },
      {
        userId: new Types.ObjectId(thirdId),
        targetUserId: new Types.ObjectId(userId),
      },
    ]);
    repo.listRoomsForUser.mockResolvedValue([createRoom()]);
    repo.findUsersByIds.mockResolvedValue([
      { _id: new Types.ObjectId(partnerId) },
      { _id: new Types.ObjectId(thirdId) },
    ]);
    repo.findProfilesByUserIds.mockResolvedValue([
      {
        userId: new Types.ObjectId(partnerId),
        personal: { firstName: 'Asha' },
        verificationStatus: VerificationStatus.NOT_STARTED,
      },
      {
        userId: new Types.ObjectId(thirdId),
        personal: { firstName: 'Nina' },
        verificationStatus: VerificationStatus.NOT_STARTED,
      },
    ]);
    await expect(
      service.getContacts(userId, { search: 'asha', page: 1, limit: 1 }),
    ).resolves.toMatchObject({
      total: 1,
      items: [expect.objectContaining({ roomId, isMatched: true })],
    });

    repo.getBlockedRelationUserIds.mockResolvedValue([partnerId]);
    repo.listRoomsForUser.mockResolvedValue([
      createRoom(),
      { ...createRoom(), participants: [new Types.ObjectId(userId)] },
    ]);
    await expect(service.getContacts(userId, {})).resolves.toMatchObject({
      total: 1,
      items: [expect.objectContaining({ userId: thirdId, roomId: null })],
    });
  });

  it('maps conversation details and emits updates to every participant', async () => {
    const room = {
      ...createRoom(ChatRoomStatus.PENDING),
      requestedById: new Types.ObjectId(userId),
      requestedAt: new Date(),
      lastMessageText: 'Hello',
      lastMessageId: new Types.ObjectId(messageId),
      lastMessageSenderId: new Types.ObjectId(userId),
      lastMessageAt: new Date(),
      lastActivityAt: new Date(),
    };
    access.getAuthorizedRoom.mockResolvedValue(room);
    repo.countUnreadByRoomIds.mockResolvedValue([{ count: 2 }]);
    repo.findUsersByIds.mockResolvedValue([
      { _id: new Types.ObjectId(userId) },
      { _id: new Types.ObjectId(partnerId) },
    ]);
    repo.findProfilesByUserIds.mockResolvedValue([
      {
        userId: new Types.ObjectId(userId),
        personal: { firstName: 'Me' },
        verificationStatus: VerificationStatus.NOT_STARTED,
      },
      {
        userId: new Types.ObjectId(partnerId),
        personal: { firstName: 'Partner' },
        verificationStatus: VerificationStatus.NOT_STARTED,
      },
    ]);
    repo.findMessagesByIds.mockResolvedValue([createMessage()]);
    await expect(
      service.getConversationDetail(userId, roomId),
    ).resolves.toMatchObject({
      roomId,
      status: ChatRoomStatus.PENDING,
      unreadCount: 2,
    });

    repo.countUnreadByRoomIds.mockResolvedValue([]);
    await expect(
      service.getConversationDetail(userId, roomId),
    ).resolves.toMatchObject({
      unreadCount: 0,
    });

    await (service as any).emitConversationUpdates(room);
    expect(realtime.emitToUser).toHaveBeenCalledTimes(2);
  });

  it('logs chat-request notification failures and applies room visibility rules', async () => {
    const privateService = service as any;
    notificationsService.notify.mockRejectedValue('unavailable');
    await privateService.notifyChatRequest(
      createRoom(ChatRoomStatus.PENDING),
      userId,
      partnerId,
      'Hello',
    );
    expect(logger.warn).toHaveBeenCalled();
    notificationsService.notify.mockRejectedValue(new Error('unavailable'));
    await privateService.notifyChatRequest(
      createRoom(ChatRoomStatus.PENDING),
      userId,
      partnerId,
      'Hello',
    );

    const stateRoom = createRoom();
    expect(privateService.shouldIncludeRoom(stateRoom, userId, false)).toBe(
      true,
    );
    stateRoom.participantStates[0].archivedAt = new Date();
    expect(privateService.shouldIncludeRoom(stateRoom, userId, false)).toBe(
      false,
    );
    expect(privateService.shouldIncludeRoom(stateRoom, userId, true)).toBe(
      true,
    );
    stateRoom.status = ChatRoomStatus.REJECTED;
    expect(privateService.shouldIncludeRoom(stateRoom, userId, true)).toBe(
      false,
    );
  });

  it('accepts and rejects actionable chat requests', async () => {
    repo.respondToChatRequest.mockResolvedValue(null);
    await expect(
      service.respondToChatRequest(userId, roomId, 'ACCEPT'),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });

    const room = {
      ...createRoom(ChatRoomStatus.REJECTED),
      requestedById: new Types.ObjectId(partnerId),
      respondedAt: new Date(),
    };
    repo.respondToChatRequest.mockResolvedValue(room);
    jest
      .spyOn(service as any, 'emitConversationUpdates')
      .mockResolvedValue(undefined);
    await expect(
      service.respondToChatRequest(userId, roomId, 'REJECT'),
    ).resolves.toMatchObject({ roomId, status: ChatRoomStatus.REJECTED });
    expect(notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ userId: partnerId }),
    );

    room.status = ChatRoomStatus.ACTIVE;
    jest
      .spyOn(service, 'getConversationDetail')
      .mockResolvedValue({ roomId } as never);
    await expect(
      service.respondToChatRequest(userId, roomId, 'ACCEPT'),
    ).resolves.toEqual({ roomId });

    repo.respondToChatRequest.mockResolvedValue({
      ...createRoom(ChatRoomStatus.REJECTED),
      requestedById: undefined,
    });
    await service.respondToChatRequest(userId, roomId, 'REJECT');
  });

  it('validates and sends messages while isolating notification failures', async () => {
    const room = createRoom();
    access.getAuthorizedRoom.mockResolvedValue(room);
    await expect(
      service.sendMessage(userId, { roomId, content: '   ' }),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_MESSAGE_EMPTY });

    jest
      .spyOn(service as any, 'createRoomMessage')
      .mockResolvedValue({ id: messageId });
    jest
      .spyOn(service as any, 'emitConversationUpdates')
      .mockResolvedValue(undefined);
    notificationsService.notify.mockRejectedValue(new Error('offline'));
    await expect(
      service.sendMessage(userId, { roomId, content: ' Hello ' }),
    ).resolves.toEqual({ id: messageId });
    await new Promise((resolve) => setImmediate(resolve));
    expect(logger.warn).toHaveBeenCalled();

    notificationsService.notify.mockRejectedValue('offline');
    await service.sendMessage(userId, {
      roomId,
      attachments: [{ url: 'https://cdn/photo', mimeType: 'image/png' }],
    });
    await new Promise((resolve) => setImmediate(resolve));
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it('creates room messages and updates both participant states', async () => {
    const room = createRoom();
    repo.createMessage.mockResolvedValue(createMessage());
    const result = await (service as any).createRoomMessage(room, userId, {
      content: 'Hello',
      type: ChatMessageType.TEXT,
      attachments: [],
    });
    expect(result).toMatchObject({ id: messageId, content: 'Hello' });
    expect(room.messageCount).toBe(1);
    expect(room.participantStates[1].unreadCount).toBe(1);
    expect(realtime.emitToConversation).toHaveBeenCalledWith(
      roomId,
      'message:new',
      expect.any(Object),
    );

    const fallbackRoom = createRoom();
    fallbackRoom.messageCount = undefined;
    fallbackRoom.participantStates[1].unreadCount = undefined;
    repo.createMessage.mockResolvedValue(
      createMessage({
        createdAt: undefined,
        content: '',
        attachments: undefined,
      }),
    );
    await (service as any).createRoomMessage(fallbackRoom, userId, {
      content: '',
      type: ChatMessageType.IMAGE,
      attachments: [{ url: 'https://cdn/photo' }],
    });
    expect(fallbackRoom.messageCount).toBe(1);
  });

  it('uploads valid media and rejects invalid attachment batches', async () => {
    await expect(service.uploadAttachments(userId, [])).rejects.toMatchObject({
      code: ErrorCode.CHAT_ATTACHMENT_INVALID,
    });
    const file = {
      mimetype: 'application/pdf',
      originalname: 'file.pdf',
      size: 20,
    } as Express.Multer.File;
    await expect(
      service.uploadAttachments(userId, [file]),
    ).rejects.toMatchObject({
      code: ErrorCode.CHAT_ATTACHMENT_INVALID,
    });
    const tooManyFiles: Express.Multer.File[] = Array.from(
      { length: 6 },
      () => ({ ...file, mimetype: 'image/png' }),
    );
    await expect(
      service.uploadAttachments(userId, tooManyFiles),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ATTACHMENT_INVALID });

    const image = { ...file, mimetype: 'image/png', originalname: 'photo.png' };
    storageService.uploadFiles.mockResolvedValue([
      { url: 'https://cdn/photo.png' },
    ]);
    await expect(service.uploadAttachments(userId, [image])).resolves.toEqual([
      expect.objectContaining({
        url: 'https://cdn/photo.png',
        name: 'photo.png',
      }),
    ]);
  });

  it('moderates and deletes messages', async () => {
    void service.getModerationQueue();
    void service.getModerationQueue(undefined, 0);
    void service.getModerationQueue(ChatModerationStatus.APPROVED, 1000);
    expect(repo.listModerationQueue).toHaveBeenCalledWith(
      ChatModerationStatus.APPROVED,
      100,
    );
    repo.reviewMessage.mockResolvedValue(null);
    await expect(
      service.reviewMessage(userId, messageId, true),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_MESSAGE_NOT_FOUND });

    const message = createMessage();
    repo.reviewMessage.mockResolvedValue({ ...message, deletedAt: new Date() });
    await service.reviewMessage(userId, messageId, false, 'unsafe');
    expect(realtime.emitToConversation).toHaveBeenCalledWith(
      roomId,
      'message:deleted',
      expect.any(Object),
    );
    repo.reviewMessage.mockResolvedValue({ ...message, deletedAt: undefined });
    await service.reviewMessage(userId, messageId, false);
    await service.reviewMessage(userId, messageId, true);

    access.getAuthorizedRoom.mockResolvedValue(createRoom());
    repo.findMessageById.mockResolvedValue(null);
    await expect(
      service.deleteOwnMessage(userId, roomId, messageId),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_MESSAGE_NOT_FOUND });
    repo.findMessageById.mockResolvedValue(message);
    repo.softDeleteMessageForEveryone.mockResolvedValue({
      deletedAt: new Date(),
    });
    await expect(
      service.deleteOwnMessage(userId, roomId, messageId),
    ).resolves.toMatchObject({ messageId });
    repo.softDeleteMessageForEveryone.mockResolvedValue(null);
    await service.deleteOwnMessage(userId, roomId, messageId);
  });

  it('marks rooms read and updates participant settings', async () => {
    const room = createRoom();
    access.getAuthorizedRoom.mockResolvedValue(room);
    repo.findMessageById.mockResolvedValue(null);
    await expect(
      service.markRoomRead(userId, roomId, { upToMessageId: messageId }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_ID });

    repo.findMessageById.mockResolvedValue(createMessage());
    repo.markRoomRead.mockResolvedValue({ modifiedCount: 2 });
    jest
      .spyOn(service as any, 'emitConversationUpdates')
      .mockResolvedValue(undefined);
    await expect(
      service.markRoomRead(userId, roomId, { upToMessageId: messageId }),
    ).resolves.toMatchObject({ updatedCount: 2 });

    room.lastMessageId = new Types.ObjectId(messageId);
    await service.markRoomRead(userId, roomId, {});
    room.lastMessageId = undefined;
    await service.markRoomRead(userId, roomId, {});

    jest
      .spyOn(service, 'getConversationDetail')
      .mockResolvedValue({ roomId } as never);
    await service.updateRoomSettings(userId, roomId, {
      archived: true,
      pinned: true,
      mutedUntil: '2026-12-01T00:00:00.000Z',
    });
    expect(room.participantStates[0]).toMatchObject({
      archivedAt: expect.any(Date),
      pinnedAt: expect.any(Date),
      mutedUntil: expect.any(Date),
    });
    await service.updateRoomSettings(userId, roomId, {
      archived: false,
      pinned: false,
      mutedUntil: null,
    });
    await service.updateRoomSettings(userId, roomId, {});
  });

  it('maps safe values, media, summaries, and previews', () => {
    const privateService = service as any;
    expect(privateService.toSafeString('value')).toBe('value');
    expect(privateService.toSafeString(2)).toBe('2');
    expect(privateService.toSafeString(true)).toBe('true');
    expect(privateService.toSafeString(new Date('2026-01-01'))).toContain(
      '2026',
    );
    expect(privateService.toSafeString(new Types.ObjectId())).toHaveLength(24);
    expect(() => privateService.toSafeString({})).toThrow();
    expect(
      privateService.mapMessage(
        createMessage({
          attachments: 'invalid',
          replyToMessageId: new Types.ObjectId(),
        }),
      ),
    ).toMatchObject({ attachments: [], replyToMessageId: expect.any(String) });

    const mediaMap = privateService.buildPrimaryMediaMap([
      { userId: new Types.ObjectId(partnerId), url: 'first' },
      { userId: partnerId, url: 'second' },
      { userId: {}, url: 'ignored' },
    ]);
    expect(mediaMap.get(partnerId).url).toBe('first');
    presence.isOnline.mockReturnValue(true);
    presence.getLastSeen.mockReturnValue(new Date());
    const summary = privateService.buildUserSummary(
      partnerId,
      new Map([[partnerId, { membership: { tier: 'gold' } }]]),
      new Map([
        [
          partnerId,
          {
            personal: { firstName: 'Asha', lastName: 'Rao', city: 'Pune' },
            verificationStatus: VerificationStatus.APPROVED,
          },
        ],
      ]),
      mediaMap,
    );
    expect(summary).toMatchObject({ fullName: 'Asha Rao', isPremium: true });
    const imageSummary = privateService.buildUserSummary(
      partnerId,
      new Map(),
      new Map([
        [
          partnerId,
          {
            profileImages: [
              { url: 'inactive', isActive: false },
              { url: 'fallback', isActive: true },
            ],
          },
        ],
      ]),
      new Map(),
    );
    expect(imageSummary.avatarUrl).toBe('fallback');
    const minimalRoom = createRoom();
    minimalRoom.lastMessageText = 'Text without ids';
    minimalRoom.lastMessageId = undefined;
    minimalRoom.lastMessageSenderId = undefined;
    minimalRoom.messageCount = undefined;
    minimalRoom.lastActivityAt = undefined;
    minimalRoom.updatedAt = new Date();
    expect(
      privateService.mapConversation(
        minimalRoom,
        userId,
        new Map(),
        new Map(),
        new Map(),
        0,
      ),
    ).toMatchObject({
      lastMessage: { id: undefined, senderId: undefined },
      messageCount: 0,
      updatedAt: minimalRoom.updatedAt,
    });
    expect(privateService.buildPreview('x'.repeat(121))).toHaveLength(120);
    expect(
      privateService.buildNotificationPreview('x'.repeat(81)),
    ).toHaveLength(80);
    expect(privateService.buildAttachmentPreview(ChatMessageType.IMAGE)).toBe(
      'Photo',
    );
    expect(privateService.buildAttachmentPreview(ChatMessageType.VIDEO)).toBe(
      'Video',
    );
    expect(privateService.buildAttachmentPreview(ChatMessageType.AUDIO)).toBe(
      'Voice message',
    );
    expect(privateService.buildAttachmentPreview(ChatMessageType.FILE)).toBe(
      'Attachment',
    );
  });

  it('enforces attachment, profanity, moderation, participant, and id helpers', () => {
    const privateService = service as any;
    expect(() =>
      privateService.ensureAttachmentsAreValid(Array(6).fill({})),
    ).toThrow();
    expect(() =>
      privateService.ensureAttachmentsAreValid([{ url: 'local' }]),
    ).toThrow();
    expect(() =>
      privateService.ensureAttachmentsAreValid([
        { url: 'https://cdn/file', mimeType: 'application/pdf' },
      ]),
    ).toThrow();
    expect(() =>
      privateService.ensureAttachmentsAreValid([
        { url: 'https://cdn/file', size: 26 * 1024 * 1024 },
      ]),
    ).toThrow();
    expect(() =>
      privateService.ensureAttachmentsAreValid([
        { url: 'https://cdn/file', mimeType: 'image/png', size: 10 },
      ]),
    ).not.toThrow();

    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'chat.profanityFilter.blockedWords') return 'bad.word';
      if (key === 'chat.profanityFilter.reviewWords') return 'review, caution ';
      return fallback;
    });
    expect(() =>
      privateService.ensureMessageIsSafe('This has bad.word'),
    ).toThrow();
    expect(privateService.getMessageModeration('needs review')).toMatchObject({
      status: ChatModerationStatus.FLAGGED,
    });
    expect(privateService.getMessageModeration('clear')).toMatchObject({
      status: ChatModerationStatus.APPROVED,
    });
    expect(() =>
      privateService.ensureMessageIsSafe('clean words'),
    ).not.toThrow();
    configService.get.mockReturnValue(false);
    expect(() => privateService.ensureMessageIsSafe('anything')).not.toThrow();
    expect(privateService.getMessageModeration('anything')).toMatchObject({
      status: ChatModerationStatus.APPROVED,
    });
    expect(privateService.parseWordList(' One, ,TWO ')).toEqual(['one', 'two']);
    expect(privateService.escapeRegExp('a.b')).toBe('a\\.b');
    expect(privateService.toObjectId(messageId)).toBeInstanceOf(Types.ObjectId);
    const objectId = new Types.ObjectId();
    expect(privateService.toObjectId(objectId)).toBe(objectId);
    expect(() => privateService.toObjectId(1)).toThrow();
    expect(() =>
      privateService.getOtherParticipantId([userId], userId),
    ).toThrow();
    expect(() => privateService.getParticipantState({}, userId)).toThrow();
  });
});
