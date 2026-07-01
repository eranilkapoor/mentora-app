import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { io, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'node:net';
import { ChatGateway } from '@/modules/chat/controllers/chat.gateway';
import { AppLogger } from '@/common/logger/logger.service';
import { ChatPresenceService } from '@/modules/chat/services/chat-presence.service';
import { ChatRealtimeService } from '@/modules/chat/services/chat-realtime.service';
import { ChatService } from '@/modules/chat/services/chat.service';

describe('P0 chat socket flows (e2e)', () => {
  jest.setTimeout(20000);

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
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    chatService.getConversationDetail.mockResolvedValue({ roomId: 'room-a' });
    chatService.getMessages.mockResolvedValue([]);
    chatService.sendMessage.mockResolvedValue({ id: 'message-1' });
    chatService.markRoomRead.mockResolvedValue({ read: true });

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

  const connectAndWaitReady =
    (
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

  const connectAndWaitAuthError =
    (
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
      roomId: 'room-a',
      isTyping: true,
    });

    const readAck = await chatGateway.handleReadReceipt(client, {
      roomId: 'room-a',
      upToMessageId: 'message-1',
    });

    expect(chatService.getConversationDetail).toHaveBeenCalledWith(
      'user-1',
      'room-a',
    );
    expect(roomEmitter.emit).toHaveBeenCalledWith('typing', {
      roomId: 'room-a',
      userId: 'user-1',
      isTyping: true,
    });
    expect(typingAck).toEqual({
      event: 'typing:ack',
      data: { roomId: 'room-a', isTyping: true },
    });
    expect(chatService.markRoomRead).toHaveBeenCalledWith('user-1', 'room-a', {
      roomId: 'room-a',
      upToMessageId: 'message-1',
    });
    expect(readAck).toEqual({
      event: 'message:read:ack',
      data: { read: true },
    });
  });

  it('supports reconnect for authenticated users', async () => {
    const { socket: first, ready: firstReady } = await connectAndWaitReady(
      'token-user-1',
    );

    first.disconnect();

    const { ready: secondReady } = await connectAndWaitReady('token-user-1');

    expect(firstReady).toEqual({ userId: 'user-1' });
    expect(secondReady).toEqual({ userId: 'user-1' });
  });

  it('rejects revoked tokens and disconnects the socket', async () => {
    const { socket, error: authError } = await connectAndWaitAuthError(
      'revoked-token',
    );

    expect(authError).toEqual({ message: 'Unauthorized' });
    expect(socket.connected).toBe(false);
  });
});
