import { ExecutionContext } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { getCorrelationId } from './decorators/correlation-id.decorator';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';

jest.mock('uuid', () => ({ v4: jest.fn() }));

describe('correlation request infrastructure', () => {
  const uuid = uuidv4 as unknown as jest.Mock;
  const middleware = new CorrelationIdMiddleware();
  const response = { setHeader: jest.fn() };
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    uuid
      .mockReturnValueOnce('generated-correlation')
      .mockReturnValueOnce('generated-request');
  });

  it('preserves caller identifiers and mirrors them to response headers', () => {
    const request = {
      headers: {
        'x-correlation-id': 'corr-1',
        'x-request-id': 'req-1',
      },
    } as never;

    middleware.use(request, response as never, next);

    expect(request).toEqual(
      expect.objectContaining({ correlationId: 'corr-1', requestId: 'req-1' }),
    );
    expect(response.setHeader).toHaveBeenNthCalledWith(
      1,
      'X-Correlation-ID',
      'corr-1',
    );
    expect(response.setHeader).toHaveBeenNthCalledWith(
      2,
      'X-Request-ID',
      'req-1',
    );
    expect(uuid).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('generates both identifiers when headers are absent', () => {
    const request = { headers: {} } as never;

    middleware.use(request, response as never, next);

    expect(request).toEqual(
      expect.objectContaining({
        correlationId: 'generated-correlation',
        requestId: 'generated-request',
      }),
    );
    expect(uuid).toHaveBeenCalledTimes(2);
  });

  it('returns the request correlation ID through the decorator factory', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ correlationId: 'corr-1' }),
      }),
    } as unknown as ExecutionContext;

    expect(getCorrelationId(undefined, context)).toBe('corr-1');
  });

  it('allows an absent correlation ID in non-middleware contexts', () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    expect(getCorrelationId(undefined, context)).toBeUndefined();
  });
});
