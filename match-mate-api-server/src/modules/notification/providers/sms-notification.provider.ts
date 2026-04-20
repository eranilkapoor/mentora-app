import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio, { type Twilio } from 'twilio';
import { AppLogger } from 'src/common/logger/logger.service';
import {
  NotificationChannelPayload,
  NotificationChannelProvider,
  NotificationChannelResult,
} from '../interfaces/notification-channel.interface';

@Injectable()
export class SmsNotificationProvider implements NotificationChannelProvider {
  readonly channel = 'sms' as const;
  private twilioClient?: Twilio;

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

    if (provider === 'twilio') {
      return this.sendViaTwilio(payload);
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

  private async sendViaTwilio(
    payload: NotificationChannelPayload,
  ): Promise<NotificationChannelResult> {
    const from = this.configService.get<string>(
      'notification.sms.twilio.from',
      '',
    );
    if (!from) {
      return {
        status: 'failed',
        provider: 'twilio',
        error: 'notification.sms.twilio.from is required for Twilio',
      };
    }

    const to = Array.isArray(payload.to) ? payload.to[0] : payload.to;

    try {
      const message = await this.getTwilioClient().messages.create({
        to,
        from,
        body: payload.message,
      });

      return {
        status: 'sent',
        provider: 'twilio',
        providerResponse: message.sid,
        responsePayload: {
          sid: message.sid,
          status: message.status,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Twilio SMS send failed';
      this.logger.error('Twilio SMS dispatch failed', message, {
        notificationId: payload.notificationId,
      });
      return {
        status: 'failed',
        provider: 'twilio',
        error: message,
      };
    }
  }

  private getTwilioClient() {
    if (this.twilioClient) {
      return this.twilioClient;
    }

    const accountSid = this.configService.get<string>(
      'notification.sms.twilio.accountSid',
      '',
    );
    const authToken = this.configService.get<string>(
      'notification.sms.twilio.authToken',
      '',
    );

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are missing');
    }

    this.twilioClient = twilio(accountSid, authToken);
    return this.twilioClient;
  }
}
