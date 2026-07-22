import { EventEmitter } from 'events';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { HybridSocketIoAdapter } from './hybrid-socket-io.adapter';

jest.mock('@socket.io/redis-adapter', () => ({ createAdapter: jest.fn() }));

class RedisClientStub extends EventEmitter {
  status = 'connecting';
  quit = jest.fn().mockResolvedValue('OK');
}

describe('HybridSocketIoAdapter', () => {
  const configService = { get: jest.fn() };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const createAdapterMock = createAdapter as jest.MockedFunction<
    typeof createAdapter
  >;

  const build = (
    pubClient: RedisClientStub | null,
    subClient: RedisClientStub | null,
  ) =>
    new HybridSocketIoAdapter(
      {} as never,
      pubClient as never,
      subClient as never,
      configService as never,
      logger as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation(
      (_key: string, fallback: string) => fallback,
    );
  });

  it('uses local mode when Redis is not configured', async () => {
    const adapter = build(null, null);

    await adapter.connect();

    expect(logger.log).toHaveBeenCalledWith('Socket.IO adapter mode: local');
  });

  it('falls back locally when configured Redis clients are unavailable', async () => {
    configService.get.mockReturnValue('redis');
    const adapter = build(null, null);

    await adapter.connect();

    expect(logger.warn).toHaveBeenCalledWith(
      'Socket.IO: Redis clients unavailable, falling back to local mode',
    );
  });

  it('connects ready Redis clients and applies their adapter to the server', async () => {
    configService.get.mockReturnValue('redis');
    const pub = new RedisClientStub();
    const sub = new RedisClientStub();
    pub.status = 'ready';
    sub.status = 'ready';
    const redisAdapter = jest.fn();
    createAdapterMock.mockReturnValue(redisAdapter as never);
    const adapter = build(pub, sub);
    const server = { adapter: jest.fn() };
    jest.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue(server);

    await adapter.connect();
    const result = adapter.createIOServer(3000, {} as never);

    expect(createAdapterMock).toHaveBeenCalledWith(pub, sub);
    expect(server.adapter).toHaveBeenCalledWith(redisAdapter);
    expect(result).toBe(server);
    expect(adapter.isRedisConnected).toBe(true);
  });

  it('waits for pending clients to emit ready', async () => {
    configService.get.mockReturnValue('redis');
    const pub = new RedisClientStub();
    const sub = new RedisClientStub();
    const adapter = build(pub, sub);

    const connecting = adapter.connect();
    pub.emit('ready');
    sub.emit('ready');
    await connecting;

    expect(createAdapterMock).toHaveBeenCalled();
    expect(pub.listenerCount('error')).toBe(0);
    expect(sub.listenerCount('ready')).toBe(0);
  });

  it('logs Redis readiness errors and retains local mode', async () => {
    configService.get.mockReturnValue('redis');
    const pub = new RedisClientStub();
    const sub = new RedisClientStub();
    const adapter = build(pub, sub);

    const connecting = adapter.connect();
    pub.emit('error', new Error('redis unavailable'));
    sub.emit('ready');
    await connecting;

    expect(logger.error).toHaveBeenCalledWith(
      'Socket.IO Redis adapter failed, falling back to local mode',
      expect.stringContaining('redis unavailable'),
    );
    expect(createAdapterMock).not.toHaveBeenCalled();
  });

  it('normalizes non-Error connection failures', async () => {
    configService.get.mockReturnValue('redis');
    const adapter = build(new RedisClientStub(), new RedisClientStub());
    const waitForReady = jest.spyOn(
      adapter as unknown as {
        waitForReady(client: unknown): Promise<void>;
      },
      'waitForReady',
    );
    waitForReady.mockRejectedValueOnce('connection refused');

    await adapter.connect();

    expect(logger.error).toHaveBeenCalledWith(
      'Socket.IO Redis adapter failed, falling back to local mode',
      expect.stringContaining('connection refused'),
    );
  });

  it('creates a local server when no Redis adapter is active', () => {
    configService.get.mockReturnValue(['*']);
    const adapter = build(null, null);
    const server = { adapter: jest.fn() };
    jest.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue(server);

    expect(adapter.createIOServer(3000)).toBe(server);
    expect(server.adapter).not.toHaveBeenCalled();
  });

  it('enforces configured origins while preserving gateway CORS options', () => {
    configService.get.mockImplementation((key: string, fallback: unknown) =>
      key === 'cors.origins' ? ['https://mentora.example'] : fallback,
    );
    const adapter = build(null, null);
    const server = { adapter: jest.fn() };
    const createServer = jest
      .spyOn(IoAdapter.prototype, 'createIOServer')
      .mockReturnValue(server);

    adapter.createIOServer(3000, {
      cors: { methods: ['GET'] },
    } as never);

    const passedOptions: unknown = createServer.mock.calls[0]?.[1];
    expect(createServer).toHaveBeenCalledWith(3000, expect.any(Object));
    expect(passedOptions).toMatchObject({
      cors: {
        methods: ['GET'],
        origin: ['https://mentora.example'],
        credentials: true,
      },
    });
  });

  it.each([null, 'invalid'])(
    'rejects an invalid Socket.IO server result',
    (server) => {
      const adapter = build(null, null);
      jest.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue(server);

      expect(() => adapter.createIOServer(3000)).toThrow(
        'Failed to create Socket.IO server',
      );
    },
  );

  it('settles client shutdown failures and reports disconnected states', async () => {
    const pub = new RedisClientStub();
    const sub = new RedisClientStub();
    pub.quit.mockRejectedValue(new Error('already closed'));
    pub.status = 'ready';
    sub.status = 'connecting';
    const adapter = build(pub, sub);

    expect(adapter.isRedisConnected).toBe(false);
    await expect(adapter.close()).resolves.toBeUndefined();

    expect(pub.quit).toHaveBeenCalled();
    expect(sub.quit).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      'Socket.IO Redis pub/sub clients closed',
    );
  });

  it('closes cleanly without Redis clients', async () => {
    const adapter = build(null, null);

    expect(adapter.isRedisConnected).toBe(false);
    await expect(adapter.close()).resolves.toBeUndefined();
  });
});
