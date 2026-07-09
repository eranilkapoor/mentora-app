const mockSesSend = jest.fn();
const mockSesClients: unknown[] = [];
const mockTlsConnect = jest.fn();
const mockTcpConnect = jest.fn();
jest.mock('@aws-sdk/client-sesv2', () => ({
  SESv2Client: jest.fn().mockImplementation((options: unknown) => {
    const client = { options, send: mockSesSend };
    mockSesClients.push(client);
    return client;
  }),
  SendEmailCommand: jest
    .fn()
    .mockImplementation((input: unknown) => ({ input })),
}));
jest.mock('node:tls', () => ({ connect: mockTlsConnect }));
jest.mock('node:net', () => ({ connect: mockTcpConnect }));

import { EventEmitter } from 'node:events';
import { EmailNotificationProvider } from './email-notification.provider';

class MockSmtpSocket extends EventEmitter {
  readonly writes: string[] = [];
  readonly setTimeout = jest.fn();
  readonly end = jest.fn();

  constructor(private readonly responses: string[]) {
    super();
  }

  write(chunk: string | Buffer) {
    this.writes.push(chunk.toString());
    const response = this.responses.shift();
    if (response) {
      setImmediate(() => this.emit('data', Buffer.from(response)));
    }
    return true;
  }
}

describe('EmailNotificationProvider', () => {
  const config = { get: jest.fn() };
  const logger = { log: jest.fn(), error: jest.fn() };
  let provider: EmailNotificationProvider;
  const payload = {
    notificationId: 'n1',
    userId: 'u1',
    to: 'user@test.com',
    title: 'Title',
    subject: 'Subject',
    message: 'Body',
    templateKey: 'WELCOME',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSesClients.length = 0;
    config.get.mockImplementation(
      (_key: string, fallback?: unknown) => fallback,
    );
    provider = new EmailNotificationProvider(config as never, logger as never);
  });

  it('skips disabled providers and missing scalar/array recipients', async () => {
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'skipped',
      provider: 'email-disabled',
    });
    config.get.mockImplementation((key: string, fallback?: unknown) =>
      key === 'notification.email.enabled' ? true : fallback,
    );
    await expect(provider.send({ ...payload, to: '' })).resolves.toMatchObject({
      provider: 'email-recipient-missing',
    });
    await expect(provider.send({ ...payload, to: [] })).resolves.toMatchObject({
      provider: 'email-recipient-missing',
    });
  });

  it('logs delivery and rejects unsupported providers', async () => {
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'notification.email.enabled') return true;
      return fallback;
    });
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'sent',
      provider: 'log',
      providerResponse: 'queued',
    });
    await provider.send({ ...payload, subject: undefined });
    expect(logger.log).toHaveBeenCalled();

    config.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'notification.email.enabled') return true;
      if (key === 'notification.email.provider') return 'custom';
      return fallback;
    });
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'failed',
      provider: 'custom',
    });
  });

  it('requires an SES sender and sends scalar/array recipients successfully', async () => {
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'notification.email.enabled') return true;
      if (key === 'notification.email.provider') return 'SES';
      return fallback;
    });
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'failed',
      error: 'notification.email.from is required for SES',
    });

    config.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'notification.email.enabled': true,
        'notification.email.provider': 'ses',
        'notification.email.from': 'from@test.com',
        'notification.email.ses.configurationSet': 'production',
        'notification.email.ses.region': 'ap-south-1',
        'notification.email.ses.accessKeyId': 'access',
        'notification.email.ses.secretAccessKey': 'secret',
      };
      return values[key] ?? fallback;
    });
    mockSesSend.mockResolvedValue({ MessageId: 'message-1' });
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'sent',
      provider: 'ses',
      providerResponse: 'message-1',
    });
    await expect(
      provider.send({
        ...payload,
        to: ['one@test.com', 'two@test.com'],
        subject: undefined,
      }),
    ).resolves.toMatchObject({ status: 'sent' });
    expect(mockSesClients).toHaveLength(1);
    expect(
      (provider as never as { getSesClient(): unknown }).getSesClient(),
    ).toBe(mockSesClients[0]);
  });

  it('uses role credentials and handles Error/unknown SES failures', async () => {
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'notification.email.enabled': true,
        'notification.email.provider': 'ses',
        'notification.email.from': 'from@test.com',
        AWS_REGION: 'us-west-2',
      };
      return values[key] ?? fallback;
    });
    mockSesSend.mockRejectedValueOnce(new Error('ses-down'));
    await expect(
      provider.send({ ...payload, title: undefined, subject: undefined }),
    ).resolves.toMatchObject({
      status: 'failed',
      error: 'ses-down',
    });
    expect(logger.error).toHaveBeenCalled();
    expect(mockSesClients[0]).toMatchObject({
      options: { region: 'us-west-2', credentials: undefined },
    });

    provider = new EmailNotificationProvider(config as never, logger as never);
    mockSesSend.mockRejectedValueOnce('unknown');
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'failed',
      error: 'SES email send failed',
    });
  });

  it('sends Hostinger-style SMTP email over implicit TLS', async () => {
    const socket = new MockSmtpSocket([
      '250-smtp.hostinger.com\r\n250 AUTH LOGIN\r\n',
      '334 VXNlcm5hbWU6\r\n',
      '334 UGFzc3dvcmQ6\r\n',
      '235 2.7.0 Authentication successful\r\n',
      '250 2.1.0 Sender OK\r\n',
      '250 2.1.5 Recipient OK\r\n',
      '354 Start mail input\r\n',
      '250 2.0.0 Queued as hostinger-1\r\n',
      '221 2.0.0 Bye\r\n',
    ]);
    mockTlsConnect.mockReturnValue(socket);
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'notification.email.enabled': true,
        'notification.email.provider': 'smtp',
        'notification.email.from': 'noreply@matchmate.test',
        'notification.email.smtp.host': 'smtp.hostinger.com',
        'notification.email.smtp.port': 465,
        'notification.email.smtp.username': 'noreply@matchmate.test',
        'notification.email.smtp.password': 'secret',
        'notification.email.smtp.secure': true,
        'notification.email.smtp.requireTls': false,
        'notification.email.smtp.rejectUnauthorized': true,
        'notification.email.smtp.timeoutMs': 5000,
      };
      return values[key] ?? fallback;
    });

    const resultPromise = provider.send(payload);
    setImmediate(() => {
      socket.emit('secureConnect');
      setImmediate(() => socket.emit('data', Buffer.from('220 ready\r\n')));
    });

    const result = await resultPromise;
    expect(result).toMatchObject({
      status: 'sent',
      provider: 'smtp',
    });
    expect(result.providerResponse).toEqual(
      expect.stringContaining('hostinger-1'),
    );
    expect(mockTlsConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.hostinger.com',
        port: 465,
        servername: 'smtp.hostinger.com',
      }),
    );
    expect(socket.writes).toEqual(
      expect.arrayContaining([
        'EHLO smtp.hostinger.com\r\n',
        'AUTH LOGIN\r\n',
        `${Buffer.from('noreply@matchmate.test').toString('base64')}\r\n`,
        `${Buffer.from('secret').toString('base64')}\r\n`,
        'MAIL FROM:<noreply@matchmate.test>\r\n',
        'RCPT TO:<user@test.com>\r\n',
        'DATA\r\n',
        'QUIT\r\n',
      ]),
    );
    expect(socket.writes.join('')).toContain('Subject: Subject');
    expect(socket.end).toHaveBeenCalled();
  });

  it('validates SMTP config and handles SMTP failures', async () => {
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'notification.email.enabled') return true;
      if (key === 'notification.email.provider') return 'smtp';
      return fallback;
    });
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'failed',
      error: 'notification.email.from is required for SMTP',
    });

    config.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'notification.email.enabled': true,
        'notification.email.provider': 'smtp',
        'notification.email.from': 'from@test.com',
        'notification.email.smtp.dsn':
          'smtps://user%40test.com:secret@smtp.hostinger.com:465',
      };
      return values[key] ?? fallback;
    });
    const socket = new MockSmtpSocket(['550 rejected\r\n']);
    mockTlsConnect.mockReturnValue(socket);
    const resultPromise = provider.send(payload);
    setImmediate(() => {
      socket.emit('secureConnect');
      setImmediate(() => socket.emit('data', Buffer.from('220 ready\r\n')));
    });
    const result = await resultPromise;
    expect(result).toMatchObject({
      status: 'failed',
      provider: 'smtp',
    });
    expect(result.error).toEqual(
      expect.stringContaining('Unexpected SMTP response'),
    );
    expect(logger.error).toHaveBeenCalledWith(
      'SMTP email dispatch failed',
      expect.any(String),
      expect.objectContaining({ notificationId: 'n1' }),
    );
  });
});
