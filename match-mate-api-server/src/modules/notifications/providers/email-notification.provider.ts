import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESv2Client,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-sesv2';
import { connect as connectTcp, Socket } from 'node:net';
import { connect as connectTls, TLSSocket } from 'node:tls';
import { AppLogger } from '@/common/logger/logger.service';
import {
  NotificationChannelPayload,
  NotificationChannelProvider,
  NotificationChannelResult,
} from '../interfaces/notification-channel.interface';

interface SmtpConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  requireTls: boolean;
  rejectUnauthorized: boolean;
  timeoutMs: number;
}

type SmtpSocket = Socket | TLSSocket;

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

    if (provider === 'smtp') {
      return this.sendViaSmtp(payload);
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
                Data: this.toPlainText(payload.message),
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

  private async sendViaSmtp(
    payload: NotificationChannelPayload,
  ): Promise<NotificationChannelResult> {
    const fromAddress = this.configService.get<string>(
      'notification.email.from',
      '',
    );
    if (!fromAddress) {
      return {
        status: 'failed',
        provider: 'smtp',
        error: 'notification.email.from is required for SMTP',
      };
    }

    const smtpConfig = this.getSmtpConfig();
    if (
      !smtpConfig.host ||
      !smtpConfig.port ||
      !smtpConfig.username ||
      !smtpConfig.password
    ) {
      return {
        status: 'failed',
        provider: 'smtp',
        error:
          'SMTP host, port, username, and password are required for SMTP email delivery',
      };
    }

    const toAddresses = Array.isArray(payload.to) ? payload.to : [payload.to];
    const message = this.buildSmtpMessage(fromAddress, toAddresses, payload);

    try {
      const response = await this.sendSmtpMessage(
        smtpConfig,
        fromAddress,
        toAddresses,
        message,
      );

      return {
        status: 'sent',
        provider: 'smtp',
        providerResponse: response,
        responsePayload: {
          accepted: toAddresses,
          host: smtpConfig.host,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'SMTP email send failed';
      this.logger.error('SMTP email dispatch failed', message, {
        notificationId: payload.notificationId,
      });
      return {
        status: 'failed',
        provider: 'smtp',
        error: message,
      };
    }
  }

  private getSmtpConfig(): SmtpConnectionConfig {
    const dsn = this.configService.get<string>(
      'notification.email.smtp.dsn',
      '',
    );
    const dsnConfig = dsn ? this.parseSmtpDsn(dsn) : {};

    return {
      host:
        dsnConfig.host ??
        this.configService.get<string>('notification.email.smtp.host', ''),
      port:
        dsnConfig.port ??
        this.configService.get<number>('notification.email.smtp.port', 587),
      username:
        dsnConfig.username ??
        this.configService.get<string>('notification.email.smtp.username', ''),
      password:
        dsnConfig.password ??
        this.configService.get<string>('notification.email.smtp.password', ''),
      secure:
        dsnConfig.secure ??
        this.configService.get<boolean>(
          'notification.email.smtp.secure',
          false,
        ),
      requireTls:
        dsnConfig.requireTls ??
        this.configService.get<boolean>(
          'notification.email.smtp.requireTls',
          true,
        ),
      rejectUnauthorized: this.configService.get<boolean>(
        'notification.email.smtp.rejectUnauthorized',
        true,
      ),
      timeoutMs: this.configService.get<number>(
        'notification.email.smtp.timeoutMs',
        15000,
      ),
    };
  }

  private parseSmtpDsn(
    dsn: string,
  ): Partial<
    Pick<
      SmtpConnectionConfig,
      'host' | 'port' | 'username' | 'password' | 'secure' | 'requireTls'
    >
  > {
    const parsed = new URL(dsn);
    const secure = parsed.protocol === 'smtps:';
    const requireTls = parsed.searchParams.get('requireTls');

    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : secure ? 465 : 587,
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      secure,
      requireTls:
        requireTls === null ? !secure : requireTls.toLowerCase() !== 'false',
    };
  }

  private buildSmtpMessage(
    fromAddress: string,
    toAddresses: string[],
    payload: NotificationChannelPayload,
  ) {
    const subject = this.sanitizeHeader(
      payload.subject ?? payload.title ?? 'Match Mate Notification',
    );
    const from = this.sanitizeHeader(fromAddress);
    const to = toAddresses.map((address) => this.sanitizeHeader(address));
    const body = this.toPlainText(payload.message).replace(/\r?\n/g, '\r\n');
    const htmlBody = payload.message;

    return [
      `From: ${from}`,
      `To: ${to.join(', ')}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="match-mate-notification"',
      '',
      '--match-mate-notification',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      body,
      '--match-mate-notification',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      htmlBody,
      '--match-mate-notification--',
      '',
    ].join('\r\n');
  }

  private sanitizeHeader(value: string) {
    return value.replace(/[\r\n]+/g, ' ').trim();
  }

  private toPlainText(value: string) {
    return value
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private async sendSmtpMessage(
    config: SmtpConnectionConfig,
    fromAddress: string,
    toAddresses: string[],
    message: string,
  ) {
    let socket = await this.openSmtpSocket(config);
    const session = this.createSmtpSession(socket, config.timeoutMs);

    try {
      await session.expect([220]);
      await session.command(`EHLO ${config.host}`, [250]);

      if (!config.secure && config.requireTls) {
        await session.command('STARTTLS', [220]);
        socket = await this.upgradeSmtpSocket(socket, config);
        session.replaceSocket(socket);
        await session.command(`EHLO ${config.host}`, [250]);
      }

      await session.command('AUTH LOGIN', [334]);
      await session.command(
        Buffer.from(config.username).toString('base64'),
        [334],
      );
      await session.command(
        Buffer.from(config.password).toString('base64'),
        [235],
      );
      await session.command(`MAIL FROM:<${fromAddress}>`, [250]);

      for (const address of toAddresses) {
        await session.command(`RCPT TO:<${address}>`, [250, 251]);
      }

      await session.command('DATA', [354]);
      const dataResponse = await session.command(`${message}\r\n.`, [250]);
      await session.command('QUIT', [221]);
      return dataResponse.message;
    } finally {
      socket.end();
    }
  }

  private openSmtpSocket(config: SmtpConnectionConfig): Promise<SmtpSocket> {
    return new Promise((resolve, reject) => {
      const socket = config.secure
        ? connectTls({
            host: config.host,
            port: config.port,
            servername: config.host,
            rejectUnauthorized: config.rejectUnauthorized,
          })
        : connectTcp({
            host: config.host,
            port: config.port,
          });

      socket.setTimeout(config.timeoutMs);
      socket.once('connect', () => {
        if (!config.secure) resolve(socket);
      });
      socket.once('secureConnect', () => {
        if (config.secure) resolve(socket);
      });
      socket.once('timeout', () =>
        reject(new Error('SMTP connection timed out')),
      );
      socket.once('error', reject);
    });
  }

  private upgradeSmtpSocket(
    socket: SmtpSocket,
    config: SmtpConnectionConfig,
  ): Promise<SmtpSocket> {
    return new Promise((resolve, reject) => {
      const secureSocket = connectTls({
        socket,
        servername: config.host,
        rejectUnauthorized: config.rejectUnauthorized,
      });
      secureSocket.setTimeout(config.timeoutMs);
      secureSocket.once('secureConnect', () => resolve(secureSocket));
      secureSocket.once('timeout', () =>
        reject(new Error('SMTP STARTTLS timed out')),
      );
      secureSocket.once('error', reject);
    });
  }

  private createSmtpSession(socket: SmtpSocket, timeoutMs: number) {
    let activeSocket = socket;
    let buffer = '';
    const waiters: Array<{
      resolve: (value: { code: number; message: string }) => void;
      reject: (reason: Error) => void;
      timer: NodeJS.Timeout;
    }> = [];

    const flush = () => {
      while (waiters.length > 0) {
        const response = this.readSmtpResponse(buffer);
        if (!response) return;
        buffer = response.remaining;
        const waiter = waiters.shift();
        if (!waiter) return;
        clearTimeout(waiter.timer);
        waiter.resolve({
          code: response.code,
          message: response.message,
        });
      }
    };

    const onData = (chunk: Buffer | string) => {
      buffer += chunk.toString();
      flush();
    };

    const onError = (error: Error) => {
      while (waiters.length > 0) {
        const waiter = waiters.shift();
        if (!waiter) return;
        clearTimeout(waiter.timer);
        waiter.reject(error);
      }
    };

    const read = () =>
      new Promise<{ code: number; message: string }>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('SMTP response timed out')),
          timeoutMs,
        );
        waiters.push({ resolve, reject, timer });
        flush();
      });

    const bind = (nextSocket: SmtpSocket) => {
      activeSocket = nextSocket;
      activeSocket.on('data', onData);
      activeSocket.on('error', onError);
    };

    bind(activeSocket);

    return {
      expect: async (codes: number[]) => {
        const response = await read();
        if (!codes.includes(response.code)) {
          throw new Error(`Unexpected SMTP response: ${response.message}`);
        }
        return response;
      },
      command: async (command: string, codes: number[]) => {
        activeSocket.write(`${command}\r\n`);
        const response = await read();
        if (!codes.includes(response.code)) {
          throw new Error(`Unexpected SMTP response: ${response.message}`);
        }
        return response;
      },
      replaceSocket: (nextSocket: SmtpSocket) => {
        activeSocket.off('data', onData);
        activeSocket.off('error', onError);
        bind(nextSocket);
      },
    };
  }

  private readSmtpResponse(buffer: string) {
    const terminator = buffer.match(/(?:^|\r?\n)(\d{3}) [^\r\n]*(?:\r?\n|$)/);
    if (!terminator || terminator.index === undefined) return null;

    const endIndex = terminator.index + terminator[0].length;
    const message = buffer.slice(0, endIndex).trimEnd();
    const code = Number(terminator[1]);

    return {
      code,
      message,
      remaining: buffer.slice(endIndex),
    };
  }
}
