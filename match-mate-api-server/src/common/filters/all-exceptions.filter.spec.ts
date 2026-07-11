import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const logger = { error: jest.fn() };
  const monitoring = { captureException: jest.fn() };
  const response = {
    headersSent: false,
    status: jest.fn(),
    json: jest.fn(),
  };
  const request = {
    url: '/api/test',
    method: 'GET',
    headers: {},
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  let filter: AllExceptionsFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    response.headersSent = false;
    response.status.mockReturnValue(response);
    filter = new AllExceptionsFilter(logger as never, monitoring as never);
  });

  it('does nothing after response headers have been sent', () => {
    response.headersSent = true;

    filter.catch(new Error('late failure'), host);

    expect(logger.error).not.toHaveBeenCalled();
    expect(response.status).not.toHaveBeenCalled();
  });

  it('formats unexpected Error instances and captures monitoring context', () => {
    const error = new Error('database failed');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: ErrorCode.INTERNAL_ERROR,
        message: 'database failed',
        correlationId: 'unknown',
        requestId: 'unknown',
      }),
    );
    expect(monitoring.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
      }),
    );
  });

  it('uses a safe generic response for non-Error values without monitoring', () => {
    filter = new AllExceptionsFilter(logger as never);

    filter.catch({ failure: true }, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
  });

  it('handles string HttpException responses and request identifiers', () => {
    request.headers = {
      'x-correlation-id': 'corr-1',
      'x-request-id': 'req-1',
    };

    filter.catch(new HttpException('Unauthorized request', 401), host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.AUTH_UNAUTHORIZED,
        message: 'Unauthorized request',
        correlationId: 'corr-1',
        requestId: 'req-1',
      }),
    );
  });

  it('preserves structured exception fields', () => {
    filter.catch(
      new HttpException(
        {
          code: 'CUSTOM.CODE',
          message: ['first', 'second'],
          errors: [{ field: 'email' }],
          data: { retryable: false },
          meta: { source: 'validation' },
        },
        400,
      ),
      host,
    );

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'CUSTOM.CODE',
        message: ['first', 'second'],
        errors: [{ field: 'email' }],
        data: { retryable: false },
        meta: { source: 'validation' },
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      'ERROR LOG :',
      expect.stringContaining('"errors":[{"field":"email"}]'),
      expect.objectContaining({ errors: [{ field: 'email' }] }),
    );
  });

  it('uses defaults for a structured response with no optional fields', () => {
    filter.catch(new HttpException({}, 400), host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.INVALID_REQUEST,
        message: 'Internal server error',
        errors: null,
        data: null,
        meta: null,
      }),
    );
  });

  it('uses defaults for a null HttpException response', () => {
    filter.catch(new HttpException(null as never, 400), host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.INVALID_REQUEST,
        message: 'Internal server error',
      }),
    );
  });

  it('returns the hardened endpoint response for 404 errors', () => {
    filter.catch(new HttpException('missing', 404), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.ENDPOINT_NOT_FOUND,
        message: 'API endpoint not found',
        path: '/api/test',
      }),
    );
  });

  it.each([
    [HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST],
    [HttpStatus.UNAUTHORIZED, ErrorCode.AUTH_UNAUTHORIZED],
    [HttpStatus.FORBIDDEN, ErrorCode.AUTH_FORBIDDEN],
    [HttpStatus.NOT_FOUND, ErrorCode.ENDPOINT_NOT_FOUND],
    [HttpStatus.TOO_MANY_REQUESTS, ErrorCode.TOO_MANY_REQUESTS],
    [HttpStatus.REQUEST_TIMEOUT, ErrorCode.REQUEST_TIMEOUT],
    [HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.SERVICE_UNAVAILABLE],
    [HttpStatus.CONFLICT, ErrorCode.INTERNAL_ERROR],
  ])('maps HTTP status %s to its default error code', (status, code) => {
    const internals = filter as unknown as {
      getDefaultErrorCode(value: HttpStatus): ErrorCode;
    };

    expect(internals.getDefaultErrorCode(status)).toBe(code);
  });
});
