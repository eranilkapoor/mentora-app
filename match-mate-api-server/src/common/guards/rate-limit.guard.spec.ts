import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitConfig } from '../decorators/rate-limit.decorator';
import { SKIP_RATE_LIMIT_KEY } from '../decorators/skip-rate-limit.decorator';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  const config: RateLimitConfig = {
    name: 'login',
    ttl: 60,
    limit: 2,
    limitPremium: 5,
    message: 'Slow down',
  };
  const logger = { warn: jest.fn() };
  const reflector = { getAllAndOverride: jest.fn() };
  const cache = { get: jest.fn(), set: jest.fn() };
  const response = { setHeader: jest.fn() };

  const createContext = (requestOverrides: Record<string, unknown> = {}) => {
    const handler = function loginHandler() {};
    const request = {
      method: 'POST',
      headers: {},
      socket: {},
      ip: '127.0.0.1',
      ...requestOverrides,
    };
    return {
      context: {
        getHandler: () => handler,
        getClass: () => class TestController {},
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => response,
        }),
      } as unknown as ExecutionContext,
      request,
    };
  };

  let guard: RateLimitGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === SKIP_RATE_LIMIT_KEY ? false : config,
    );
    cache.get.mockResolvedValue(null);
    cache.set.mockResolvedValue(undefined);
    guard = new RateLimitGuard(
      logger as never,
      reflector as unknown as Reflector,
      cache as never,
    );
  });

  it('allows explicitly skipped routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(createContext().context)).resolves.toBe(
      true,
    );
    expect(cache.get).not.toHaveBeenCalled();
  });

  it('allows routes without rate-limit metadata', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === SKIP_RATE_LIMIT_KEY ? false : undefined,
    );

    await expect(guard.canActivate(createContext().context)).resolves.toBe(
      true,
    );
  });

  it('uses the trusted Express IP and ignores spoofable forwarded headers', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    const { context } = createContext({
      route: { path: '/auth/login' },
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(cache.set).toHaveBeenCalledWith(
      'rate-limit:login:POST:/auth/login:127.0.0.1',
      { count: 1, expiresAt: 61_000 },
      60,
    );
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 2);
  });

  it.each([
    [{ user: { sub: 'user-1', membership: { tier: 'free' } } }, 2],
    [{ user: { sub: 'user-1', membership: { tier: 'gold' } } }, 5],
    [{ user: { sub: 'user-1' } }, 2],
  ])('selects the correct membership limit', async (overrides, expected) => {
    await guard.canActivate(createContext(overrides).context);

    expect(response.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Limit',
      expected,
    );
  });

  it('uses the standard limit when a premium override is absent', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === SKIP_RATE_LIMIT_KEY
        ? false
        : { ...config, limitPremium: undefined },
    );

    await guard.canActivate(
      createContext({ user: { membership: { tier: 'gold' } } }).context,
    );

    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 2);
  });

  it('increments an existing entry with its remaining TTL', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    cache.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ count: 1, expiresAt: 31_000 });

    await guard.canActivate(createContext({ route: { path: 42 } }).context);

    expect(cache.set).toHaveBeenCalledWith(
      expect.stringContaining(':loginHandler:'),
      { count: 2, expiresAt: 31_000 },
      30,
    );
  });

  it('falls back to configured TTL when an existing entry has expired', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(10_000);
    cache.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ count: 0, expiresAt: 9_000 });

    await guard.canActivate(createContext({ route: 'invalid' }).context);

    expect(cache.set).toHaveBeenCalledWith(
      expect.any(String),
      { count: 1, expiresAt: 9_000 },
      60,
    );
  });

  it('rejects identifiers already under a temporary block', async () => {
    cache.get.mockResolvedValueOnce(true);

    await expect(guard.canActivate(createContext().context)).rejects.toThrow(
      new HttpException('Too many requests. Try later.', 429),
    );
  });

  it('blocks abusive identifiers and returns retry metadata at the limit', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    cache.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ count: 5, expiresAt: 11_000 });

    await expect(
      guard.canActivate(createContext().context),
    ).rejects.toMatchObject({
      status: 429,
      response: {
        statusCode: 429,
        message: 'Slow down',
        retryAfter: 10,
        resetAt: 11_000,
      },
    });
    expect(cache.set).toHaveBeenCalledWith('blocked:127.0.0.1', true, 3600);
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', 10);
    expect(logger.warn).toHaveBeenCalled();
  });

  it.each([
    [{ socket: { remoteAddress: '192.0.2.1' }, ip: undefined }, '192.0.2.1'],
    [{ socket: {}, ip: '192.0.2.2' }, '192.0.2.2'],
    [{ socket: {}, ip: undefined }, 'unknown'],
  ])('uses the available network identifier', async (overrides, identifier) => {
    await guard.canActivate(createContext(overrides).context);

    expect(cache.set).toHaveBeenCalledWith(
      expect.stringMatching(`${identifier}$`),
      expect.any(Object),
      expect.any(Number),
    );
  });

  it('serializes concurrent requests for the same key', async () => {
    let releaseFirst!: (value: null) => void;
    const firstRead = new Promise<null>((resolve) => {
      releaseFirst = resolve;
    });
    cache.get
      .mockImplementationOnce(() => firstRead)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    const context = createContext({ user: { sub: 'user-1' } }).context;

    const first = guard.canActivate(context);
    const second = guard.canActivate(context);
    await Promise.resolve();
    expect(cache.set).not.toHaveBeenCalled();

    releaseFirst(null);
    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(cache.set).toHaveBeenCalledTimes(2);
  });

  it('clears an unexpectedly oversized lock map during release', async () => {
    const internals = guard as unknown as {
      locks: Map<string, Promise<void>>;
      acquireLock(key: string): Promise<() => void>;
    };
    const release = await internals.acquireLock('active');
    for (let index = 0; index <= 10_000; index += 1) {
      internals.locks.set(`stale-${index}`, Promise.resolve());
    }

    release();

    expect(internals.locks.size).toBe(0);
  });
});
