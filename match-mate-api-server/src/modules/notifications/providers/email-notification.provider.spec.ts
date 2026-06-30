const mockSesSend = jest.fn();
const mockSesClients: unknown[] = [];
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

import { EmailNotificationProvider } from './email-notification.provider';

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
});
