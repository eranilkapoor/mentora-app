import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const correlationId = request['correlationId'];
    const requestId = request['requestId'];
    const userAgent = headers['user-agent'] || 'unknown';
    const clientVersion = headers['x-client-version'] || 'unknown';
    const platform = headers['x-platform'] || 'unknown';
    const deviceId = headers['x-device-id'] || 'unknown';

    const startTime = Date.now();

    // Log incoming request
    this.logger.log({
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
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;

          // Log successful response
          this.logger.log({
            type: 'RESPONSE',
            correlationId,
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          // Log error response
          this.logger.error({
            type: 'ERROR',
            correlationId,
            requestId,
            method,
            url,
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};

    // Remove sensitive data from logs
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'creditCard', 'cvv'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}