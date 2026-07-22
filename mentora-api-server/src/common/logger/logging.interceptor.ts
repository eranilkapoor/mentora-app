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
  path: string;
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
  clientIp: string;
  remoteIp: string;
  forwardedFor: string;
  origin: string;
  referer: string;
  userId: string;
  timestamp: string;
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
  errorType: string;
  stack?: string;
  duration: string;
  timestamp: string;
}

const UNKNOWN = 'unknown';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path } = request as ApiRequest;
    const url = path || '/';
    const headers = request.headers as RequestHeaders;

    const correlationId = headers['x-correlation-id'] ?? UNKNOWN;
    const requestId = headers['x-request-id'] ?? UNKNOWN;
    const userAgent = headers['user-agent'] ?? UNKNOWN;
    const clientVersion = headers['x-client-version'] ?? UNKNOWN;
    const platform = headers['x-platform'] ?? UNKNOWN;
    const deviceId = headers['x-device-id'] ?? UNKNOWN;
    const forwardedFor = request.headers['x-forwarded-for'];
    const userId = this.getUserId(request.user);

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
      clientIp: request.ip || UNKNOWN,
      remoteIp: request.socket?.remoteAddress || UNKNOWN,
      forwardedFor: Array.isArray(forwardedFor)
        ? forwardedFor.join(',')
        : forwardedFor || UNKNOWN,
      origin: request.headers.origin || UNKNOWN,
      referer: request.headers.referer || UNKNOWN,
      userId,
      timestamp: new Date().toISOString(),
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
          const err =
            error instanceof Error ? error : new Error('Unknown error');

          const errorLog: ErrorLog = {
            type: 'ERROR',
            correlationId,
            requestId,
            method,
            url,
            errorType: err.name || 'Error',
            stack: err.stack,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          };

          this.logger.error('ERROR', err.stack, errorLog);
        },
      }),
    );
  }

  private getUserId(user: Express.User | undefined): string {
    if (!user || !('sub' in user)) return UNKNOWN;
    const sub = user.sub;
    return typeof sub === 'string' && sub ? sub : UNKNOWN;
  }
}
