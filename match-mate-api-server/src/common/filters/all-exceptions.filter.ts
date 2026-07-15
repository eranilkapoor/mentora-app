import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/logger.service';
import { ErrorCode } from '../constants';
import { ErrorMonitoringService } from '../monitoring/error-monitoring.service';

interface ValidationErrorResponse {
  code?: string;
  message?: string | string[];
  errors?: unknown;
  data?: unknown;
  meta?: Record<string, any>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLogger,
    private readonly monitoring?: ErrorMonitoringService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const safePath = request.path || request.url?.split('?')[0] || '/';

    if (response.headersSent) {
      return;
    }

    const correlationId =
      (request.headers['x-correlation-id'] as string) || 'unknown';
    const requestId = (request.headers['x-request-id'] as string) || 'unknown';
    const requestUserId = this.getUserId(request.user);
    const forwardedFor = request.headers['x-forwarded-for'];

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: unknown = null;
    let data: unknown = null;
    let meta: Record<string, any> | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = this.getDefaultErrorCode(status);

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as ValidationErrorResponse;
        code = res.code ?? code;
        message = res.message ?? message;
        errors = res.errors ?? null;
        data = res.data ?? null;
        meta = res.meta ?? null;
      }
    }

    const logContext = {
      success: false,
      path: safePath,
      method: request.method,
      correlationId,
      requestId,
      clientIp: request.ip || 'unknown',
      remoteIp: request.socket?.remoteAddress || 'unknown',
      forwardedFor: Array.isArray(forwardedFor)
        ? forwardedFor.join(',')
        : forwardedFor || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
      origin: request.headers.origin || 'unknown',
      referer: request.headers.referer || 'unknown',
      userId: requestUserId,
      statusCode: status,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : message,
      errors: status === HttpStatus.INTERNAL_SERVER_ERROR ? undefined : errors,
      stack:
        status >= HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error
          ? exception.stack
          : undefined,
      timestamp: new Date().toISOString(),
      code,
      meta,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error('ERROR LOG :', JSON.stringify(logContext), logContext);

      this.monitoring?.captureException(exception, {
        path: safePath,
        method: request.method,
        correlationId,
        requestId,
        statusCode: status,
        code,
        meta,
      });
    } else {
      this.logger.warn('REQUEST REJECTED :', logContext);
    }

    // Custom 404 response
    if (status === HttpStatus.NOT_FOUND) {
      response.status(404).json({
        success: false,
        code: ErrorCode.ENDPOINT_NOT_FOUND,
        statusCode: status,
        message: 'API endpoint not found',
        data,
        correlationId,
        requestId,
        errors,
        meta,
        path: safePath,
        timestamp: new Date().toISOString(),
      });

      return;
    }

    // Send error response
    response.status(status).json({
      success: false,
      code,
      message,
      data,
      errors,
      meta,
      statusCode: status,
      correlationId,
      requestId,
      timestamp: new Date().toISOString(),
      path: safePath,
    });
  }

  private getDefaultErrorCode(status: HttpStatus): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.INVALID_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.AUTH_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.AUTH_FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.ENDPOINT_NOT_FOUND;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.TOO_MANY_REQUESTS;
      case HttpStatus.REQUEST_TIMEOUT:
        return ErrorCode.REQUEST_TIMEOUT;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }

  private getUserId(user: Express.User | undefined): string {
    if (!user || !('sub' in user)) return 'anonymous';
    const sub = user.sub;
    return typeof sub === 'string' && sub ? sub : 'anonymous';
  }
}
