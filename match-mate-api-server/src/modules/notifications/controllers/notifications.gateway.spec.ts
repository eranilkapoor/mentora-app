/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsGateway', () => {
  const userId = 'user-1';

  const realtime = {
    bindServer: jest.fn(),
    getUserRoom: jest.fn((id: string) => `notification:user:${id}`),
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

  const server = { to: jest.fn(), emit: jest.fn() };

  let gateway: NotificationsGateway;

  const socket = (overrides: Record<string, unknown> = {}) =>
    ({
      data: {},
      handshake: {
        auth: { token: 'Bearer token-1' },
        headers: {},
        query: {},
      },
      join: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      disconnect: jest.fn(),
      ...overrides,
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new NotificationsGateway(
      realtime as any,
      jwtService as any,
      configService as any,
      logger as any,
    );
    jwtService.verifyAsync.mockResolvedValue({ sub: userId });
  });

  it('binds the realtime service after initialization', () => {
    gateway.afterInit(server as any);

    expect(realtime.bindServer).toHaveBeenCalledWith(server);
  });

  it('authenticates with bearer token from auth payload', async () => {
    const client = socket();

    await gateway.handleConnection(client);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token-1', {
      secret: 'secret',
      audience: 'audience',
      issuer: 'issuer',
    });
    expect(client.join).toHaveBeenCalledWith(`notification:user:${userId}`);
    expect(client.emit).toHaveBeenCalledWith('connection:ready', { userId });
    expect(client.data.userId).toBe(userId);
  });

  it('accepts a raw token from the auth payload', async () => {
    const client = socket({
      handshake: {
        auth: { token: 'raw-auth-token' },
        headers: {},
        query: {},
      },
    });

    await gateway.handleConnection(client);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'raw-auth-token',
      expect.any(Object),
    );
  });

  it('accepts bearer token from headers and query params', async () => {
    const headerClient = socket({
      handshake: {
        auth: {},
        headers: { authorization: 'Bearer header-token' },
        query: {},
      },
    });
    const queryClient = socket({
      handshake: {
        auth: {},
        headers: {},
        query: { token: 'Bearer query-token' },
      },
    });

    await gateway.handleConnection(headerClient);
    await gateway.handleConnection(queryClient);

    expect(jwtService.verifyAsync).toHaveBeenNthCalledWith(1, 'header-token', {
      secret: 'secret',
      audience: 'audience',
      issuer: 'issuer',
    });
    expect(jwtService.verifyAsync).toHaveBeenNthCalledWith(2, 'query-token', {
      secret: 'secret',
      audience: 'audience',
      issuer: 'issuer',
    });
  });

  it('accepts a raw query token after unusable headers', async () => {
    const client = socket({
      handshake: {
        auth: { token: '   ' },
        headers: { authorization: ['Bearer ignored'] },
        query: { token: 'raw-query-token' },
      },
    });

    await gateway.handleConnection(client);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'raw-query-token',
      expect.any(Object),
    );
  });

  it('rejects sockets without a usable token', async () => {
    const client = socket({
      handshake: { auth: {}, headers: {}, query: {} },
    });

    await gateway.handleConnection(client);

    expect(logger.warn).toHaveBeenCalledWith(
      'Notification socket authentication failed: Missing token',
    );
    expect(client.emit).toHaveBeenCalledWith('connection:error', {
      message: 'Unauthorized',
    });
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('uses a generic message for non-Error authentication failures', async () => {
    jwtService.verifyAsync.mockRejectedValue('denied');
    const client = socket();

    await gateway.handleConnection(client);

    expect(logger.warn).toHaveBeenCalledWith(
      'Notification socket authentication failed: Unauthorized',
    );
  });

  it('allows Socket.IO to handle disconnect cleanup', () => {
    expect(gateway.handleDisconnect()).toBeUndefined();
  });
});
