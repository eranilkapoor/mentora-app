import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { io, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'node:net';
import { Types } from 'mongoose';
import { ChatGateway } from '@/modules/chat/controllers/chat.gateway';
import { AppLogger } from '@/common/logger/logger.service';
import { ChatPresenceService } from '@/modules/chat/services/chat-presence.service';
import { ChatRealtimeService } from '@/modules/chat/services/chat-realtime.service';
import { ChatService } from '@/modules/chat/services/chat.service';
import { FeatureService } from '@/modules/subscriptions/services/feature.service';

describe('P0 chat socket flows (e2e)', () => {
  jest.setTimeout(20000);

  const roomA = new Types.ObjectId().toString();
  const roomB = new Types.ObjectId().toString();
  const messageId = new Types.ObjectId().toString();

  let app: INestApplication;
  let baseUrl: string;
  let chatGateway: ChatGateway;

  const chatService = {
    getConversationDetail: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markRoomRead: jest.fn(),
  };

  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.secret': 'test-secret',
        'jwt.audience': 'test-audience',
        'jwt.issuer': 'test-issuer',
      };
      return values[key];
    }),
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.audience': 'test-audience',
        'jwt.issuer': 'test-issuer',
      };
      return values[key];
    }),
  };

  const logger = {
    warn: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const featureService = {
    checkAccess: jest.fn(),
  };

  const openSockets: ClientSocket[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChatGateway,
        ChatPresenceService,
        ChatRealtimeService,
        { provide: ChatService, useValue: chatService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: AppLogger, useValue: logger },
        { provide: FeatureService, useValue: featureService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(0);
    chatGateway = moduleRef.get(ChatGateway);

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(() => {
    for (const socket of openSockets.splice(0)) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    chatService.getConversationDetail.mockResolvedValue({ roomId: roomA });
    chatService.getMessages.mockResolvedValue([]);
    chatService.sendMessage.mockResolvedValue({ id: messageId });
    chatService.markRoomRead.mockResolvedValue({ read: true });
    featureService.checkAccess.mockResolvedValue({ allowed: true });

    jwtService.verifyAsync.mockImplementation(
      async (token: string): Promise<{ sub: string }> => {
        if (token === 'revoked-token') {
          throw new Error('Unauthorized');
        }

        if (token.startsWith('token-')) {
          return { sub: token.slice(6) };
        }

        throw new Error('Unauthorized');
      },
    );
  });

  const createClient = (token: string): ClientSocket => {
    const socket = io(`${baseUrl}/chats`, {
      transports: ['websocket'],
      forceNew: true,
      autoConnect: false,
      timeout: 1500,
      auth: { token },
    });

    openSockets.push(socket);
    return socket;
  };

  const connectAndWaitReady = (
    token: string,
  ): Promise<{ socket: ClientSocket; ready: { userId: string } }> =>
    new Promise((resolve, reject) => {
      const socket = createClient(token);

      const timeout = setTimeout(() => {
        reject(new Error(`Socket ready timeout for token: ${token}`));
      }, 2500);

      socket.once('connect_error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });

      socket.once('connection:ready', (ready: { userId: string }) => {
        clearTimeout(timeout);
        resolve({ socket, ready });
      });

      socket.connect();
    });

  const connectAndWaitAuthError = (
    token: string,
  ): Promise<{ socket: ClientSocket; error: { message: string } }> =>
    new Promise((resolve, reject) => {
      const socket = createClient(token);

      const timeout = setTimeout(() => {
        reject(new Error(`Socket auth error timeout for token: ${token}`));
      }, 2500);

      socket.once('connect_error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });

      socket.once('connection:error', (error: { message: string }) => {
        clearTimeout(timeout);
        resolve({ socket, error });
      });

      socket.connect();
    });

  const emitAndWaitEvent = <TEvent>(
    socket: ClientSocket,
    emitEvent: string,
    payload: unknown,
    expectedEvent: string,
  ): Promise<TEvent> =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.off(expectedEvent, handler);
        reject(
          new Error(
            `Timeout waiting for ${expectedEvent} after ${emitEvent} emit`,
          ),
        );
      }, 2500);

      const handler = (eventPayload: TEvent) => {
        clearTimeout(timeout);
        socket.off(expectedEvent, handler);
        resolve(eventPayload);
      };

      socket.on(expectedEvent, handler);
      socket.emit(emitEvent, payload);
    });

  const waitForTypedEvents = (
    socket: ClientSocket,
    expectedCount: number,
  ): Promise<Array<{ roomId: string; userId: string; isTyping: boolean }>> =>
    new Promise((resolve, reject) => {
      const events: Array<{
        roomId: string;
        userId: string;
        isTyping: boolean;
      }> = [];

      const timeout = setTimeout(() => {
        socket.off('typing', handler);
        reject(new Error('Timed out waiting for typing events'));
      }, 2500);

      const handler = (event: {
        roomId: string;
        userId: string;
        isTyping: boolean;
      }) => {
        events.push(event);

        if (events.length === expectedCount) {
          clearTimeout(timeout);
          socket.off('typing', handler);
          resolve(events);
        }
      };

      socket.on('typing', handler);
    });

  const expectNoTypingEvent = (
    socket: ClientSocket,
    waitMs = 300,
  ): Promise<{ roomId: string; userId: string; isTyping: boolean } | null> =>
    new Promise((resolve) => {
      let settled = false;

      const handler = (event: {
        roomId: string;
        userId: string;
        isTyping: boolean;
      }) => {
        if (settled) {
          return;
        }

        settled = true;
        socket.off('typing', handler);
        resolve(event);
      };

      socket.on('typing', handler);

      setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        socket.off('typing', handler);
        resolve(null);
      }, waitMs);
    });

  it('authenticates connection and emits connection ready payload', async () => {
    const { ready } = await connectAndWaitReady('token-user-1');

    expect(ready).toEqual({ userId: 'user-1' });
  });

  it('processes typing and read-receipt payloads for authenticated sockets', async () => {
    const roomEmitter = { emit: jest.fn() };
    type GatewaySocket = Parameters<ChatGateway['handleTyping']>[0];
    const client = {
      data: { userId: 'user-1' },
      to: jest.fn(() => roomEmitter),
    } as unknown as GatewaySocket;

    const typingAck = await chatGateway.handleTyping(client, {
      roomId: roomA,
      isTyping: true,
    });

    const readAck = await chatGateway.handleReadReceipt(client, {
      roomId: roomA,
      upToMessageId: messageId,
    });

    expect(chatService.getConversationDetail).toHaveBeenCalledWith(
      'user-1',
      roomA,
    );
    expect(roomEmitter.emit).toHaveBeenCalledWith('typing', {
      roomId: roomA,
      userId: 'user-1',
      isTyping: true,
    });
    expect(typingAck).toEqual({
      event: 'typing:ack',
      data: { roomId: roomA, isTyping: true },
    });
    expect(chatService.markRoomRead).toHaveBeenCalledWith('user-1', roomA, {
      roomId: roomA,
      upToMessageId: messageId,
    });
    expect(readAck).toEqual({
      event: 'message:read:ack',
      data: { read: true },
    });
  });

  it('supports reconnect for authenticated users', async () => {
    const { socket: first, ready: firstReady } =
      await connectAndWaitReady('token-user-1');

    first.disconnect();

    const { ready: secondReady } = await connectAndWaitReady('token-user-1');

    expect(firstReady).toEqual({ userId: 'user-1' });
    expect(secondReady).toEqual({ userId: 'user-1' });
  });

  it('rejects revoked tokens and disconnects the socket', async () => {
    const { socket, error: authError } =
      await connectAndWaitAuthError('revoked-token');

    expect(authError).toEqual({ message: 'Unauthorized' });
    expect(socket.connected).toBe(false);
  });

  it('enforces room isolation and preserves typing event order inside a room', async () => {
    chatService.getConversationDetail.mockImplementation(
      async (_userId: string, roomId: string) => ({ roomId }),
    );

    const { socket: sender } = await connectAndWaitReady('token-user-1');
    const { socket: sameRoomPeer } = await connectAndWaitReady('token-user-2');
    const { socket: otherRoomPeer } = await connectAndWaitReady('token-user-3');

    await emitAndWaitEvent<{ roomId: string }>(
      sender,
      'room:join',
      {
        roomId: roomA,
      },
      'room:joined',
    );
    await emitAndWaitEvent<{ roomId: string }>(
      sameRoomPeer,
      'room:join',
      { roomId: roomA },
      'room:joined',
    );
    await emitAndWaitEvent<{ roomId: string }>(
      otherRoomPeer,
      'room:join',
      { roomId: roomB },
      'room:joined',
    );

    const inRoomEventsPromise = waitForTypedEvents(sameRoomPeer, 2);
    const outRoomEventPromise = expectNoTypingEvent(otherRoomPeer);

    const typingAckOne = await emitAndWaitEvent<{
      roomId: string;
      isTyping: boolean;
    }>(sender, 'typing', { roomId: roomA, isTyping: true }, 'typing:ack');

    const typingAckTwo = await emitAndWaitEvent<{
      roomId: string;
      isTyping: boolean;
    }>(sender, 'typing', { roomId: roomA, isTyping: false }, 'typing:ack');

    const inRoomEvents = await inRoomEventsPromise;
    const outRoomEvent = await outRoomEventPromise;

    expect(typingAckOne).toEqual({ roomId: roomA, isTyping: true });
    expect(typingAckTwo).toEqual({ roomId: roomA, isTyping: false });
    expect(inRoomEvents).toEqual([
      {
        roomId: roomA,
        userId: 'user-1',
        isTyping: true,
      },
      {
        roomId: roomA,
        userId: 'user-1',
        isTyping: false,
      },
    ]);
    expect(outRoomEvent).toBeNull();
  });

  it('replays room join message fetch deterministically across leave and rejoin', async () => {
    chatService.getConversationDetail.mockImplementation(
      async (_userId: string, roomId: string) => ({ roomId }),
    );
    chatService.getMessages
      .mockResolvedValueOnce([{ id: 'snapshot-1' }])
      .mockResolvedValueOnce([{ id: 'snapshot-2' }]);

    const { socket } = await connectAndWaitReady('token-user-1');

    const firstJoinAck = await emitAndWaitEvent<{ roomId: string }>(
      socket,
      'room:join',
      { roomId: roomA },
      'room:joined',
    );

    const leaveAck = await emitAndWaitEvent<{ roomId: string }>(
      socket,
      'room:leave',
      { roomId: roomA },
      'room:left',
    );

    const secondJoinAck = await emitAndWaitEvent<{ roomId: string }>(
      socket,
      'room:join',
      { roomId: roomA },
      'room:joined',
    );

    expect(firstJoinAck).toEqual({ roomId: roomA });
    expect(leaveAck).toEqual({ roomId: roomA });
    expect(secondJoinAck).toEqual({ roomId: roomA });
    expect(chatService.getMessages).toHaveBeenNthCalledWith(
      1,
      'user-1',
      roomA,
      { limit: 20 },
    );
    expect(chatService.getMessages).toHaveBeenNthCalledWith(
      2,
      'user-1',
      roomA,
      { limit: 20 },
    );
  });
});
