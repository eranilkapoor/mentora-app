/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { WsException } from '@nestjs/websockets';
import { ChatGateway } from './chat.gateway';

describe('ChatGateway', () => {
  const userId = 'user-1';
  const roomId = 'room-1';

  const chatService = {
    getConversationDetail: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markRoomRead: jest.fn(),
  };

  const presence = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    getLastSeen: jest.fn(),
  };

  const realtime = {
    bindServer: jest.fn(),
    getUserRoom: jest.fn((id: string) => `chat:user:${id}`),
    getConversationRoom: jest.fn((id: string) => `chat:conversation:${id}`),
  };

  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.secret': 'secret',
        'jwt.audience': 'audience',
        'jwt.issuer': 'issuer',
      };
      return values[key];
    }),
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.audience': 'audience',
        'jwt.issuer': 'issuer',
      };
      return values[key];
    }),
  };

  const logger = {
    warn: jest.fn(),
  };

  const featureService = {
    checkAccess: jest.fn(),
  };

  const serverRoomEmitter = {
    emit: jest.fn(),
  };

  const server = {
    to: jest.fn(() => serverRoomEmitter),
  };

  let gateway: ChatGateway;

  const socket = (overrides: Record<string, unknown> = {}) =>
    ({
      id: 'socket-1',
      data: {},
      handshake: {
        auth: { token: 'Bearer token-1' },
        headers: {},
        query: {},
      },
      join: jest.fn().mockResolvedValue(undefined),
      leave: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      disconnect: jest.fn(),
      to: jest.fn(() => ({ emit: jest.fn() })),
      ...overrides,
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new ChatGateway(
      chatService as any,
      presence as any,
      realtime as any,
      jwtService as any,
      configService as any,
      logger as any,
      featureService as any,
    );
    gateway.server = server as any;
    jwtService.verifyAsync.mockResolvedValue({ sub: userId });
    featureService.checkAccess.mockResolvedValue({ allowed: true });
  });

  it('binds the realtime server after initialization', () => {
    gateway.afterInit(server as any);

    expect(realtime.bindServer).toHaveBeenCalledWith(server);
  });

  it('authenticates a socket and joins the user room', async () => {
    const client = socket();

    await gateway.handleConnection(client);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token-1', {
      secret: 'secret',
      audience: 'audience',
      issuer: 'issuer',
    });
    expect(featureService.checkAccess).toHaveBeenCalledWith('chat_access', {
      userId,
      timestamp: expect.any(Date),
    });
    expect(presence.connect).toHaveBeenCalledWith(userId, 'socket-1');
    expect(client.join).toHaveBeenCalledWith(`chat:user:${userId}`);
    expect(client.emit).toHaveBeenCalledWith('connection:ready', { userId });
    expect(serverRoomEmitter.emit).toHaveBeenCalledWith('presence:update', {
      userId,
      isOnline: true,
    });
  });

  it('rejects unauthenticated sockets', async () => {
    const client = socket({
      handshake: { auth: {}, headers: {}, query: {} },
    });

    await gateway.handleConnection(client);

    expect(logger.warn).toHaveBeenCalledWith(
      'Socket authentication failed: Missing token',
    );
    expect(client.emit).toHaveBeenCalledWith('connection:error', {
      message: 'Unauthorized',
    });
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('logs a generic reason for non-Error authentication failures', async () => {
    jwtService.verifyAsync.mockRejectedValue('denied');
    const client = socket();

    await gateway.handleConnection(client);

    expect(logger.warn).toHaveBeenCalledWith(
      'Socket authentication failed: Unauthorized',
    );
  });

  it('rejects sockets without chat plan access', async () => {
    featureService.checkAccess.mockRejectedValue(new Error('plan denied'));
    const client = socket();

    await gateway.handleConnection(client);

    expect(logger.warn).toHaveBeenCalledWith(
      'Socket authentication failed: plan denied',
    );
    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(presence.connect).not.toHaveBeenCalled();
  });

  it('updates presence when a connected socket disconnects', () => {
    const lastSeen = new Date('2026-06-23T00:00:00.000Z');
    presence.disconnect.mockReturnValue(userId);
    presence.getLastSeen.mockReturnValue(lastSeen);

    gateway.handleDisconnect(socket());

    expect(server.to).toHaveBeenCalledWith(`chat:user:${userId}`);
    expect(serverRoomEmitter.emit).toHaveBeenCalledWith('presence:update', {
      userId,
      isOnline: false,
      lastSeen,
    });
  });

  it('does nothing when a disconnected socket has no active presence', () => {
    presence.disconnect.mockReturnValue(undefined);

    gateway.handleDisconnect(socket());

    expect(server.to).not.toHaveBeenCalled();
  });

  it('joins and leaves conversation rooms after authorization', async () => {
    const client = socket({ data: { userId } });

    const joined = await gateway.handleJoinRoom(client, { roomId });
    const left = await gateway.handleLeaveRoom(client, { roomId });

    expect(chatService.getConversationDetail).toHaveBeenCalledWith(
      userId,
      roomId,
    );
    expect(chatService.getMessages).toHaveBeenCalledWith(userId, roomId, {
      limit: 20,
    });
    expect(client.join).toHaveBeenCalledWith(`chat:conversation:${roomId}`);
    expect(client.leave).toHaveBeenCalledWith(`chat:conversation:${roomId}`);
    expect(joined).toEqual({ event: 'room:joined', data: { roomId } });
    expect(left).toEqual({ event: 'room:left', data: { roomId } });
  });

  it('handles socket messages, read receipts, and typing acknowledgements', async () => {
    const roomEmitter = { emit: jest.fn() };
    const client = socket({
      data: { userId },
      to: jest.fn(() => roomEmitter),
    });
    chatService.sendMessage.mockResolvedValue({ id: 'message-1' });
    chatService.markRoomRead.mockResolvedValue({ read: true });

    const sent = await gateway.handleMessage(client, {
      roomId,
      content: 'Hello',
    });
    const read = await gateway.handleReadReceipt(client, {
      roomId,
      upToMessageId: 'message-1',
    });
    const typing = await gateway.handleTyping(client, {
      roomId,
      isTyping: true,
    });

    expect(chatService.sendMessage).toHaveBeenCalledWith(userId, {
      roomId,
      content: 'Hello',
    });
    expect(featureService.checkAccess).toHaveBeenCalledWith('message_limit', {
      userId,
      timestamp: expect.any(Date),
    });
    expect(chatService.markRoomRead).toHaveBeenCalledWith(userId, roomId, {
      roomId,
      upToMessageId: 'message-1',
    });
    expect(roomEmitter.emit).toHaveBeenCalledWith('typing', {
      roomId,
      userId,
      isTyping: true,
    });
    expect(sent).toEqual({
      event: 'message:sent',
      data: { id: 'message-1' },
    });
    expect(read).toEqual({
      event: 'message:read:ack',
      data: { read: true },
    });
    expect(typing).toEqual({
      event: 'typing:ack',
      data: { roomId, isTyping: true },
    });
  });

  it('throws a websocket exception when event handlers lack an authenticated user', async () => {
    await expect(
      gateway.handleMessage(socket(), { roomId, content: 'Hello' }),
    ).rejects.toBeInstanceOf(WsException);
  });

  it.each([
    [
      {
        auth: { token: 'raw-auth-token' },
        headers: {},
        query: {},
      },
      'raw-auth-token',
    ],
    [
      {
        auth: {},
        headers: { authorization: 'Bearer header-token' },
        query: {},
      },
      'header-token',
    ],
    [
      {
        auth: { token: '   ' },
        headers: { authorization: ['ignored'] },
        query: { token: 'Bearer query-token' },
      },
      'query-token',
    ],
    [
      {
        auth: { token: 123 },
        headers: { authorization: 'Basic ignored' },
        query: { token: 'raw-query-token' },
      },
      'raw-query-token',
    ],
  ])('accepts supported socket token shapes', async (handshake, token) => {
    const client = socket({ handshake });

    await gateway.handleConnection(client);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      token,
      expect.any(Object),
    );
  });

  it.each([
    { auth: undefined, headers: {}, query: {} },
    { auth: { token: '' }, headers: {}, query: { token: '' } },
    { auth: {}, headers: {}, query: { token: 123 } },
  ])('rejects unusable socket token shapes', async (handshake) => {
    const client = socket({ handshake });

    await gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalledWith(true);
  });
});
