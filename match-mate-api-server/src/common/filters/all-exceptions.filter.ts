import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationErrorResponse {
  message?: string | string[];
  errors?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request.headers['x-correlation-id'] as string) || 'unknown';
    const requestId = (request.headers['x-request-id'] as string) || 'unknown';

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as ValidationErrorResponse;
        message = res.message ?? message;
        errors = res.errors ?? null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error with correlation ID
    this.logger.error({
      success: false,
      path: request.url,
      method: request.method,
      correlationId,
      requestId,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Custom 404 response
    if (status === HttpStatus.NOT_FOUND) {
      response.status(404).json({
        success: false,
        statusCode: 404,
        message: 'API endpoint not found',
        correlationId,
        requestId,
        errors,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // Send error response
    response.status(status).json({
      success: false,
      message,
      errors,
      statusCode: status,
      correlationId,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
