import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  const logger = { log: jest.fn(), error: jest.fn() };
  const response = { statusCode: 201 };

  const context = (request: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    }) as unknown as ExecutionContext;

  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValue(1_025);
    interceptor = new LoggingInterceptor(logger as never);
  });

  afterEach(() => jest.restoreAllMocks());

  it('redacts every sensitive field and logs a successful response', async () => {
    const request = {
      method: 'POST',
      url: '/auth/login',
      headers: {
        'x-correlation-id': 'corr-1',
        'x-request-id': 'req-1',
        'x-client-version': '1.0.0',
        'x-platform': 'web',
        'x-device-id': 'device-1',
        'user-agent': 'jest',
      },
      body: {
        email: 'user@example.com',
        password: 'secret',
        token: 'token',
        creditCard: '4111',
        cvv: '123',
        ssn: '999',
        secret: 'value',
        authorization: 'Bearer token',
      },
    };
    const next = { handle: () => of({ ok: true }) } as CallHandler;

    await expect(
      lastValueFrom(interceptor.intercept(context(request), next)),
    ).resolves.toEqual({ ok: true });

    expect(logger.log).toHaveBeenNthCalledWith(
      1,
      'REQUEST',
      expect.objectContaining({
        correlationId: 'corr-1',
        body: {
          email: 'user@example.com',
          password: '***REDACTED***',
          token: '***REDACTED***',
          creditCard: '***REDACTED***',
          cvv: '***REDACTED***',
          ssn: '***REDACTED***',
          secret: '***REDACTED***',
          authorization: '***REDACTED***',
        },
      }),
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      2,
      'RESPONSE',
      expect.objectContaining({ statusCode: 201, duration: '25ms' }),
    );
  });

  it('uses safe defaults for missing headers and a non-object body', async () => {
    const request = {
      method: 'GET',
      url: '/health',
      headers: {},
      body: undefined,
    };

    await lastValueFrom(
      interceptor.intercept(context(request), { handle: () => of(null) }),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'REQUEST',
      expect.objectContaining({
        correlationId: 'unknown',
        requestId: 'unknown',
        userAgent: 'unknown',
        clientVersion: 'unknown',
        platform: 'unknown',
        deviceId: 'unknown',
        body: {},
      }),
    );
  });

  it.each([new Error('failed'), 'provider failed'])(
    'logs observable errors without consuming them',
    async (failure) => {
      const request = {
        method: 'GET',
        url: '/failure',
        headers: {},
        body: {},
      };

      await expect(
        lastValueFrom(
          interceptor.intercept(context(request), {
            handle: () => throwError(() => failure),
          }),
        ),
      ).rejects.toBe(failure);

      expect(logger.error).toHaveBeenCalledWith(
        'ERROR',
        expect.any(String),
        expect.objectContaining({
          error: failure instanceof Error ? 'failed' : 'provider failed',
          duration: '25ms',
        }),
      );
    },
  );
});
