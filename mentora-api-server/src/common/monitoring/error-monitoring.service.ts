import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { AppLogger } from '../logger/logger.service';

type MonitoringContext = Record<string, unknown>;

const SENSITIVE_KEY =
  /(?:authorization|cookie|password|secret|token|otp|code|credential|message|content|kyc|payment|email|phone|address|birth|device|ip)/i;

const scrubMonitoringValue = (value: unknown, depth = 0): unknown => {
  if (depth > 8) return '[TRUNCATED]';
  if (Array.isArray(value)) {
    return value.map((item) => scrubMonitoringValue(item, depth + 1));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        SENSITIVE_KEY.test(key)
          ? '[REDACTED]'
          : scrubMonitoringValue(nested, depth + 1),
      ]),
    );
  }
  if (typeof value !== 'string') return value;

  return value
    .replace(/bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(
      /([?&](?:token|code|otp|key|secret|password)=)[^&#\s]*/gi,
      '$1[REDACTED]',
    )
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]');
};

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
      beforeSend: (event) => scrubMonitoringValue(event) as typeof event,
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
        Sentry.captureException(exception, {
          extra: scrubMonitoringValue(context) as MonitoringContext,
        });
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
            }
          : { type: typeof exception },
      ...(scrubMonitoringValue(context) as MonitoringContext),
    });
  }
}
