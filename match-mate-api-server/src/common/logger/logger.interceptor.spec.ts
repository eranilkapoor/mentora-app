import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError, lastValueFrom } from 'rxjs';
import { LoggingInterceptor } from './logger.interceptor';

describe('LoggingInterceptor', () => {
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const buildContext = () => {
    const req = {
      method: 'POST',
      url: '/api/v1/auth/login',
      body: { email: 'a@b.com', password: 'secret' },
      headers: {
        'x-correlation-id': 'corr-1',
        'x-request-id': 'req-1',
      },
    };

    const res = { statusCode: 201 };

    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as ExecutionContext;

    return { context, req };
  };

  afterEach(() => jest.clearAllMocks());

  it('should log request and response for success flow', async () => {
    const interceptor = new LoggingInterceptor(logger as any);
    const { context } = buildContext();
    const next: CallHandler = { handle: () => of({ ok: true }) };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(logger.log).toHaveBeenCalledWith('REQUEST', expect.any(Object));
    expect(logger.log).toHaveBeenCalledWith('RESPONSE', expect.any(Object));

    const requestPayload = (logger.log as jest.Mock).mock.calls[0][1];
    expect(requestPayload.body.password).toBe('***REDACTED***');
  });

  it('should log error for failed flow', async () => {
    const interceptor = new LoggingInterceptor(logger as any);
    const { context } = buildContext();
    const next: CallHandler = {
      handle: () => throwError(() => new Error('boom')),
    };

    await expect(
      lastValueFrom(interceptor.intercept(context, next)),
    ).rejects.toThrow('boom');
    expect(logger.error).toHaveBeenCalledWith(
      'ERROR',
      expect.any(String),
      expect.any(Object),
    );
  });
});
