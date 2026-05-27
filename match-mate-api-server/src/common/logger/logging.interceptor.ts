import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AppLogger } from './logger.service';

type ApiRequest = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: Record<string, unknown>;
};

interface RequestHeaders {
  'x-correlation-id'?: string;
  'x-request-id'?: string;
  'x-client-version'?: string;
  'x-platform'?: string;
  'x-device-id'?: string;
  'user-agent'?: string;
}

interface RequestLog {
  type: 'REQUEST';
  correlationId: string;
  requestId: string;
  method: string;
  url: string;
  clientVersion: string;
  platform: string;
  deviceId: string;
  userAgent: string;
  timestamp: string;
  body: Record<string, unknown>;
}

interface ResponseLog {
  type: 'RESPONSE';
  correlationId: string;
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  duration: string;
  timestamp: string;
}

interface ErrorLog {
  type: 'ERROR';
  correlationId: string;
  requestId: string;
  method: string;
  url: string;
  error: string;
  stack?: string;
  duration: string;
  timestamp: string;
}

type SanitizedBody = Record<string, unknown>;

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'creditCard',
  'cvv',
  'ssn',
  'secret',
  'authorization',
] as const;

const REDACTED = '***REDACTED***';
const UNKNOWN = 'unknown';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request as ApiRequest;
    const headers = request.headers as RequestHeaders;

    const correlationId = headers['x-correlation-id'] ?? UNKNOWN;
    const requestId = headers['x-request-id'] ?? UNKNOWN;
    const userAgent = headers['user-agent'] ?? UNKNOWN;
    const clientVersion = headers['x-client-version'] ?? UNKNOWN;
    const platform = headers['x-platform'] ?? UNKNOWN;
    const deviceId = headers['x-device-id'] ?? UNKNOWN;

    const startTime = Date.now();

    const requestLog: RequestLog = {
      type: 'REQUEST',
      correlationId,
      requestId,
      method,
      url,
      clientVersion,
      platform,
      deviceId,
      userAgent,
      timestamp: new Date().toISOString(),
      body: this.sanitizeBody(body as Record<string, unknown>),
    };

    this.logger.log('REQUEST', requestLog);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - startTime;

          const responseLog: ResponseLog = {
            type: 'RESPONSE',
            correlationId,
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          };

          this.logger.log('RESPONSE', responseLog);
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const err = error instanceof Error ? error : new Error(String(error));

          const errorLog: ErrorLog = {
            type: 'ERROR',
            correlationId,
            requestId,
            method,
            url,
            error: err.message,
            stack: err.stack,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          };

          this.logger.error('ERROR', err.stack, errorLog);
        },
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): SanitizedBody {
    if (!body || typeof body !== 'object') return {};

    const sanitized: SanitizedBody = { ...body };

    for (const field of SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = REDACTED;
      }
    }

    return sanitized;
  }
}
