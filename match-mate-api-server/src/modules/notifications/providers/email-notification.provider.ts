import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESv2Client,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-sesv2';
import { AppLogger } from '@/common/logger/logger.service';
import {
  NotificationChannelPayload,
  NotificationChannelProvider,
  NotificationChannelResult,
} from '../interfaces/notification-channel.interface';

@Injectable()
export class EmailNotificationProvider implements NotificationChannelProvider {
  readonly channel = 'email' as const;
  private sesClient?: SESv2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async send(
    payload: NotificationChannelPayload,
  ): Promise<NotificationChannelResult> {
    const enabled = this.configService.get<boolean>(
      'notification.email.enabled',
      false,
    );

    if (!enabled) {
      return {
        status: 'skipped',
        provider: 'email-disabled',
        error: 'Email provider is disabled',
      };
    }

    if (!payload.to || (Array.isArray(payload.to) && payload.to.length === 0)) {
      return {
        status: 'skipped',
        provider: 'email-recipient-missing',
        error: 'No email recipient available',
      };
    }

    const provider = this.configService
      .get<string>('notification.email.provider', 'log')
      .toLowerCase();

    if (provider === 'ses') {
      return this.sendViaSes(payload);
    }

    if (provider === 'log') {
      this.logger.log('Email notification dispatched', {
        to: payload.to,
        subject: payload.subject ?? payload.title,
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
      error: `Unsupported email provider: ${provider}`,
    };
  }

  private async sendViaSes(
    payload: NotificationChannelPayload,
  ): Promise<NotificationChannelResult> {
    const fromAddress = this.configService.get<string>(
      'notification.email.from',
      '',
    );
    if (!fromAddress) {
      return {
        status: 'failed',
        provider: 'ses',
        error: 'notification.email.from is required for SES',
      };
    }

    const toAddresses = Array.isArray(payload.to) ? payload.to : [payload.to];

    try {
      const input: SendEmailCommandInput = {
        FromEmailAddress: fromAddress,
        Destination: {
          ToAddresses: toAddresses,
        },
        Content: {
          Simple: {
            Subject: {
              Data:
                payload.subject ?? payload.title ?? 'Match Mate Notification',
            },
            Body: {
              Text: {
                Data: payload.message,
              },
              Html: {
                Data: payload.message,
              },
            },
          },
        },
      };

      const configurationSetName = this.configService.get<string>(
        'notification.email.ses.configurationSet',
        '',
      );

      if (configurationSetName) {
        input.ConfigurationSetName = configurationSetName;
      }

      const response = await this.getSesClient().send(
        new SendEmailCommand(input),
      );

      return {
        status: 'sent',
        provider: 'ses',
        providerResponse: response.MessageId,
        responsePayload: {
          messageId: response.MessageId,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'SES email send failed';
      this.logger.error('SES email dispatch failed', message, {
        notificationId: payload.notificationId,
      });
      return {
        status: 'failed',
        provider: 'ses',
        error: message,
      };
    }
  }

  private getSesClient() {
    if (this.sesClient) {
      return this.sesClient;
    }

    const region = this.configService.get<string>(
      'notification.email.ses.region',
      this.configService.get<string>('AWS_REGION', 'us-east-1'),
    );

    const accessKeyId = this.configService.get<string>(
      'notification.email.ses.accessKeyId',
      '',
    );
    const secretAccessKey = this.configService.get<string>(
      'notification.email.ses.secretAccessKey',
      '',
    );

    this.sesClient = new SESv2Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });

    return this.sesClient;
  }
}
