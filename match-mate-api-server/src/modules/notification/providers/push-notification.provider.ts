import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { AppLogger } from '@/common/logger/logger.service';
import {
  NotificationChannelPayload,
  NotificationChannelProvider,
  NotificationChannelResult,
} from '../interfaces/notification-channel.interface';

@Injectable()
export class PushNotificationProvider implements NotificationChannelProvider {
  readonly channel = 'push' as const;
  private firebaseApp?: App;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async send(
    payload: NotificationChannelPayload,
  ): Promise<NotificationChannelResult> {
    const enabled = this.configService.get<boolean>(
      'notification.push.enabled',
      false,
    );

    if (!enabled) {
      return {
        status: 'skipped',
        provider: 'push-disabled',
        error: 'Push provider is disabled',
      };
    }

    const deviceTokens = this.extractDeviceTokens(payload.metadata);

    if (deviceTokens.length === 0) {
      return {
        status: 'skipped',
        provider: 'push-disabled',
        error: 'No push tokens provided in metadata.pushTokens',
      };
    }

    const provider = this.configService
      .get<string>('notification.push.provider', 'log')
      .toLowerCase();

    if (provider === 'fcm') {
      return this.sendViaFcm(payload, deviceTokens);
    }

    if (provider === 'log') {
      this.logger.log('Push notification dispatched', {
        tokenCount: deviceTokens.length,
        notificationId: payload.notificationId,
        templateKey: payload.templateKey,
      });

      return {
        status: 'sent',
        provider: 'log',
        providerResponse: 'queued',
        responsePayload: {
          queuedAt: new Date().toISOString(),
          tokenCount: deviceTokens.length,
        },
      };
    }

    return {
      status: 'failed',
      provider,
      error: `Unsupported push provider: ${provider}`,
    };
  }

  private async sendViaFcm(
    payload: NotificationChannelPayload,
    tokens: string[],
  ): Promise<NotificationChannelResult> {
    const app = this.getFirebaseApp();
    const messaging = getMessaging(app);

    try {
      const data = this.serializeData(payload);

      if (tokens.length === 1) {
        const messageId = await messaging.send({
          token: tokens[0],
          notification: {
            title: payload.title ?? 'MatchMate',
            body: payload.message,
          },
          data,
        });

        return {
          status: 'sent',
          provider: 'fcm',
          providerResponse: messageId,
          responsePayload: {
            messageId,
            tokenCount: 1,
          },
        };
      }

      const result = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title ?? 'MatchMate',
          body: payload.message,
        },
        data,
      });

      if (result.successCount === 0) {
        return {
          status: 'failed',
          provider: 'fcm',
          error: 'All push sends failed',
          responsePayload: {
            successCount: result.successCount,
            failureCount: result.failureCount,
          },
        };
      }

      return {
        status: 'sent',
        provider: 'fcm',
        providerResponse: 'multicast',
        responsePayload: {
          successCount: result.successCount,
          failureCount: result.failureCount,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'FCM push send failed';
      this.logger.error('FCM push dispatch failed', message, {
        notificationId: payload.notificationId,
      });
      return {
        status: 'failed',
        provider: 'fcm',
        error: message,
      };
    }
  }

  private getFirebaseApp() {
    if (this.firebaseApp) {
      return this.firebaseApp;
    }

    const appName = 'notification-push';
    const existing = getApps().find((app) => app.name === appName);
    if (existing) {
      this.firebaseApp = existing;
      return this.firebaseApp;
    }

    const rawJson = this.configService.get<string>(
      'notification.push.fcm.serviceAccountJson',
      '',
    );

    let projectId = this.configService.get<string>(
      'notification.push.fcm.projectId',
      '',
    );
    let clientEmail = this.configService.get<string>(
      'notification.push.fcm.clientEmail',
      '',
    );
    let privateKey = this.configService.get<string>(
      'notification.push.fcm.privateKey',
      '',
    );

    if (rawJson) {
      const parsed = JSON.parse(rawJson) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      projectId = parsed.project_id ?? projectId;
      clientEmail = parsed.client_email ?? clientEmail;
      privateKey = parsed.private_key ?? privateKey;
    }

    privateKey = privateKey.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('FCM credentials are missing');
    }

    this.firebaseApp = initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      },
      appName,
    );

    return this.firebaseApp;
  }

  private extractDeviceTokens(metadata?: Record<string, unknown>) {
    if (!metadata) {
      return [] as string[];
    }

    const tokens = metadata.pushTokens;

    if (Array.isArray(tokens)) {
      return tokens.filter(
        (token): token is string => typeof token === 'string',
      );
    }

    return [] as string[];
  }

  private serializeData(payload: NotificationChannelPayload) {
    const data: Record<string, string> = {
      notificationId: payload.notificationId,
      userId: payload.userId,
    };

    if (payload.templateKey) {
      data.templateKey = payload.templateKey;
    }

    if (payload.metadata) {
      for (const [key, value] of Object.entries(payload.metadata)) {
        if (key === 'pushTokens' || value === undefined || value === null) {
          continue;
        }

        data[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }

    return data;
  }
}
