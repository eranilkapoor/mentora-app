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

    if (response.headersSent) {
      return;
    }

    const correlationId =
      (request.headers['x-correlation-id'] as string) || 'unknown';
    const requestId = (request.headers['x-request-id'] as string) || 'unknown';

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
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error with correlation ID
    this.logger.error(
      'ERROR LOG :',
      JSON.stringify({
        success: false,
        path: request.url,
        method: request.method,
        correlationId,
        requestId,
        statusCode: status,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
        timestamp: new Date().toISOString(),
      }),
      {
        success: false,
        path: request.url,
        method: request.method,
        correlationId,
        requestId,
        statusCode: status,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
        timestamp: new Date().toISOString(),
      },
    );

    this.monitoring?.captureException(exception, {
      path: request.url,
      method: request.method,
      correlationId,
      requestId,
      statusCode: status,
      code,
    });

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
        path: request.url,
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
      path: request.url,
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
}
