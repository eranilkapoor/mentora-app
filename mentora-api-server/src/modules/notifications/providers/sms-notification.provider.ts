import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '@/common/logger/logger.service';
import {
  NotificationChannelPayload,
  NotificationChannelProvider,
  NotificationChannelResult,
} from '../interfaces/notification-channel.interface';

interface Msg91Response {
  type?: string;
  message?: string;
  request_id?: string;
}

interface Msg91Metadata extends Record<string, unknown> {
  msg91TemplateId?: string;
  msg91Variables?: Record<string, string | number>;
}

const normalizeMobile = (value: string): string => value.replace(/\D/g, '');

const toMsg91Metadata = (metadata?: Record<string, unknown>): Msg91Metadata =>
  metadata ?? {};

@Injectable()
export class SmsNotificationProvider implements NotificationChannelProvider {
  readonly channel = 'sms' as const;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async send(
    payload: NotificationChannelPayload,
  ): Promise<NotificationChannelResult> {
    const enabled = this.configService.get<boolean>(
      'notification.sms.enabled',
      false,
    );

    if (!enabled) {
      return {
        status: 'skipped',
        provider: 'sms-disabled',
        error: 'SMS provider is disabled',
      };
    }

    if (!payload.to || (Array.isArray(payload.to) && payload.to.length === 0)) {
      return {
        status: 'skipped',
        provider: 'sms-recipient-missing',
        error: 'No phone recipient available',
      };
    }

    const provider = this.configService
      .get<string>('notification.sms.provider', 'log')
      .toLowerCase();

    if (provider === 'msg91') {
      return this.sendViaMsg91(payload);
    }

    if (provider === 'log') {
      this.logger.log('SMS notification dispatched', {
        to: payload.to,
        notificationId: payload.notificationId,
        templateKey: payload.templateKey,
      });

      return {
        status: 'sent',
        provider: 'log',
        providerResponse: 'queued',
        responsePayload: {
          queuedAt: new Date().toISOString(),
        },
      };
    }

    return {
      status: 'failed',
      provider,
      error: `Unsupported sms provider: ${provider}`,
    };
  }

  private async sendViaMsg91(
    payload: NotificationChannelPayload,
  ): Promise<NotificationChannelResult> {
    const authKey = this.configService.get<string>(
      'notification.sms.msg91.authKey',
      '',
    );
    const metadata = toMsg91Metadata(payload.metadata);
    const templateId =
      metadata.msg91TemplateId ||
      this.configService.get<string>('notification.sms.msg91.templateId', '');

    if (!authKey || !templateId) {
      return {
        status: 'failed',
        provider: 'msg91',
        error: 'MSG91 auth key and template ID are required',
      };
    }

    const recipients = (Array.isArray(payload.to) ? payload.to : [payload.to])
      .map(normalizeMobile)
      .filter(Boolean)
      .map((mobiles) => ({
        mobiles,
        MESSAGE: payload.message,
        ...(metadata.msg91Variables ?? {}),
      }));

    if (recipients.length === 0) {
      return {
        status: 'failed',
        provider: 'msg91',
        error: 'MSG91 requires a phone number including country code',
      };
    }

    const baseUrl = this.configService
      .get<string>(
        'notification.sms.msg91.baseUrl',
        'https://control.msg91.com',
      )
      .replace(/\/$/, '');
    const timeoutMs = this.configService.get<number>(
      'notification.sms.msg91.timeoutMs',
      10_000,
    );

    try {
      const response = await fetch(`${baseUrl}/api/v5/flow/`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authkey: authKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          short_url: '0',
          recipients,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const responsePayload = (await response.json()) as Msg91Response;
      const providerFailed =
        !response.ok || responsePayload.type?.toLowerCase() === 'error';

      if (providerFailed) {
        throw new Error(
          responsePayload.message ||
            `MSG91 returned HTTP ${response.status.toString()}`,
        );
      }

      return {
        status: 'sent',
        provider: 'msg91',
        providerResponse:
          responsePayload.request_id || responsePayload.message || 'accepted',
        responsePayload: {
          type: responsePayload.type,
          message: responsePayload.message,
          requestId: responsePayload.request_id,
        },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'MSG91 SMS send failed';
      this.logger.error('MSG91 SMS dispatch failed', message, {
        notificationId: payload.notificationId,
        templateKey: payload.templateKey,
      });
      return {
        status: 'failed',
        provider: 'msg91',
        error: message,
      };
    }
  }
}
