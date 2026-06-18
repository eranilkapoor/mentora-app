import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { AppLogger } from '../logger/logger.service';

type MonitoringContext = Record<string, unknown>;

@Injectable()
export class ErrorMonitoringService {
  private sentryInitialized = false;
  private sentryWarningLogged = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  initialize(): void {
    if (!this.configService.get<boolean>('monitoring.enabled', false)) {
      return;
    }

    const provider = this.configService.get<string>(
      'monitoring.provider',
      'log',
    );

    if (provider !== 'sentry' || this.sentryInitialized) {
      return;
    }

    const dsn = this.configService.get<string>('monitoring.sentryDsn', '');
    if (!dsn) {
      this.logger.warn(
        'Sentry monitoring is enabled but SENTRY_DSN is empty.',
        {
          context: 'ErrorMonitoringService',
        },
      );
      return;
    }

    Sentry.init({
      dsn,
      environment: this.configService.get<string>('env', 'development'),
      tracesSampleRate: this.configService.get<number>(
        'monitoring.tracesSampleRate',
        0,
      ),
    });

    this.sentryInitialized = true;
    this.logger.log('Sentry monitoring initialized.');
  }

  captureException(exception: unknown, context: MonitoringContext = {}): void {
    if (!this.configService.get<boolean>('monitoring.enabled', false)) {
      return;
    }

    const provider = this.configService.get<string>(
      'monitoring.provider',
      'log',
    );

    if (provider === 'sentry') {
      if (this.sentryInitialized) {
        Sentry.captureException(exception, { extra: context });
      } else if (!this.sentryWarningLogged) {
        this.logger.warn(
          'Monitoring provider is set to sentry, but Sentry is not initialized.',
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
