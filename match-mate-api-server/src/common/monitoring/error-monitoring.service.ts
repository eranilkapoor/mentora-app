import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger.service';

type MonitoringContext = Record<string, unknown>;

@Injectable()
export class ErrorMonitoringService {
  private sentryWarningLogged = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  captureException(exception: unknown, context: MonitoringContext = {}): void {
    if (!this.configService.get<boolean>('monitoring.enabled', false)) {
      return;
    }

    const provider = this.configService.get<string>(
      'monitoring.provider',
      'log',
    );

    if (provider === 'sentry') {
      if (!this.sentryWarningLogged) {
        this.logger.warn(
          'Monitoring provider is set to sentry, but Sentry SDK is not wired in this build.',
          { context: 'ErrorMonitoringService' },
        );
        this.sentryWarningLogged = true;
      }
      return;
    }

    this.logger.error('Captured exception for monitoring', undefined, {
      exception:
        exception instanceof Error
          ? {
              name: exception.name,
              message: exception.message,
              stack: exception.stack,
            }
          : exception,
      ...context,
    });
  }
}
