/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const mockSend = jest.fn();
const mockSendEach = jest.fn();
const mockGetMessaging = jest.fn(() => ({
  send: mockSend,
  sendEachForMulticast: mockSendEach,
}));
const mockGetApps = jest.fn();
const mockInitializeApp = jest.fn((options: unknown, name: string) => ({
  options,
  name,
}));
const mockCert = jest.fn((credentials: unknown) => credentials);

jest.mock('firebase-admin/app', () => ({
  getApps: mockGetApps,
  initializeApp: mockInitializeApp,
  cert: mockCert,
}));
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: mockGetMessaging,
}));

import { PushNotificationProvider } from './push-notification.provider';
import type { NotificationChannelPayload } from '../interfaces/notification-channel.interface';

describe('PushNotificationProvider', () => {
  const config = { get: jest.fn() };
  const logger = { log: jest.fn(), error: jest.fn() };
  const repo = { findActivePushTokens: jest.fn() };
  let provider: PushNotificationProvider;
  const payload: NotificationChannelPayload = {
    notificationId: 'n1',
    userId: 'u1',
    to: 'u1',
    title: 'Title',
    message: 'Body',
    templateKey: 'WELCOME',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    config.get.mockImplementation(
      (_key: string, fallback?: unknown) => fallback,
    );
    repo.findActivePushTokens.mockResolvedValue([]);
    mockGetApps.mockReturnValue([]);
    provider = new PushNotificationProvider(
      config as never,
      logger as never,
      repo as never,
    );
  });

  const enable = (providerName = 'log') => {
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'notification.push.enabled') return true;
      if (key === 'notification.push.provider') return providerName;
      return fallback;
    });
  };

  it('skips disabled delivery and missing repository tokens', async () => {
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'skipped',
      provider: 'push-disabled',
    });
    enable();
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'skipped',
      error: 'No push tokens provided in metadata.pushTokens',
    });
    expect(repo.findActivePushTokens).toHaveBeenCalledWith('u1');
  });

  it('logs valid metadata tokens and rejects unsupported providers', async () => {
    enable();
    await expect(
      provider.send({
        ...payload,
        metadata: { pushTokens: ['one', 2, 'two'] },
      }),
    ).resolves.toMatchObject({
      status: 'sent',
      provider: 'log',
      responsePayload: expect.objectContaining({ tokenCount: 2 }),
    });
    expect(repo.findActivePushTokens).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalled();

    enable('custom');
    repo.findActivePushTokens.mockResolvedValue(['token']);
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'failed',
      provider: 'custom',
    });
  });

  it('requires FCM credentials and sends one token with serialized data', async () => {
    enable('fcm');
    repo.findActivePushTokens.mockResolvedValue(['token']);
    await expect(provider.send(payload)).rejects.toThrow(
      'FCM credentials are missing',
    );

    config.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'notification.push.enabled': true,
        'notification.push.provider': 'fcm',
        'notification.push.fcm.projectId': 'project',
        'notification.push.fcm.clientEmail': 'firebase@test.com',
        'notification.push.fcm.privateKey': 'line1\\nline2',
      };
      return values[key] ?? fallback;
    });
    mockSend.mockResolvedValue('message-1');
    await expect(
      provider.send({
        ...payload,
        title: undefined,
        metadata: {
          pushTokens: ['token'],
          string: 'value',
          object: { key: true },
          nil: null,
          missing: undefined,
        },
      }),
    ).resolves.toMatchObject({
      status: 'sent',
      providerResponse: 'message-1',
      responsePayload: { messageId: 'message-1', tokenCount: 1 },
    });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        notification: { title: 'Mentora', body: 'Body' },
        data: expect.objectContaining({
          templateKey: 'WELCOME',
          string: 'value',
          object: '{"key":true}',
        }),
      }),
    );
    expect(mockCert).toHaveBeenCalledWith(
      expect.objectContaining({ privateKey: 'line1\nline2' }),
    );
    expect(
      (provider as never as { getFirebaseApp(): unknown }).getFirebaseApp(),
    ).toBe(mockInitializeApp.mock.results[0].value);
  });

  it('uses existing Firebase apps and JSON credentials', async () => {
    const existing = { name: 'notification-push' };
    mockGetApps.mockReturnValue([existing, { name: 'other' }]);
    enable('fcm');
    repo.findActivePushTokens.mockResolvedValue(['token']);
    mockSend.mockResolvedValue('existing-message');
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'sent',
    });
    expect(mockInitializeApp).not.toHaveBeenCalled();

    provider = new PushNotificationProvider(
      config as never,
      logger as never,
      repo as never,
    );
    mockGetApps.mockReturnValue([]);
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'notification.push.enabled': true,
        'notification.push.provider': 'fcm',
        'notification.push.fcm.serviceAccountJson': JSON.stringify({
          project_id: 'json-project',
          client_email: 'json@test.com',
          private_key: 'json-key',
        }),
      };
      return values[key] ?? fallback;
    });
    await provider.send(payload);
    expect(mockCert).toHaveBeenLastCalledWith(
      expect.objectContaining({ projectId: 'json-project' }),
    );

    provider = new PushNotificationProvider(
      config as never,
      logger as never,
      repo as never,
    );
    config.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'notification.push.enabled': true,
        'notification.push.provider': 'fcm',
        'notification.push.fcm.serviceAccountJson': '{}',
        'notification.push.fcm.projectId': 'fallback-project',
        'notification.push.fcm.clientEmail': 'fallback@test.com',
        'notification.push.fcm.privateKey': 'fallback-key',
      };
      return values[key] ?? fallback;
    });
    await provider.send(payload);
    expect(mockCert).toHaveBeenLastCalledWith(
      expect.objectContaining({ projectId: 'fallback-project' }),
    );
  });

  it('handles multicast all-failed and partial-success results', async () => {
    const existing = { name: 'notification-push' };
    mockGetApps.mockReturnValue([existing]);
    enable('fcm');
    repo.findActivePushTokens.mockResolvedValue(['one', 'two']);
    mockSendEach.mockResolvedValueOnce({ successCount: 0, failureCount: 2 });
    await expect(
      provider.send({ ...payload, title: undefined }),
    ).resolves.toMatchObject({
      status: 'failed',
      error: 'All push sends failed',
    });
    mockSendEach.mockResolvedValueOnce({ successCount: 1, failureCount: 1 });
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'sent',
      providerResponse: 'multicast',
    });
  });

  it('handles Error and unknown FCM send failures', async () => {
    mockGetApps.mockReturnValue([{ name: 'notification-push' }]);
    enable('fcm');
    repo.findActivePushTokens.mockResolvedValue(['token']);
    mockSend.mockRejectedValueOnce(new Error('fcm-down'));
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'failed',
      error: 'fcm-down',
    });
    expect(logger.error).toHaveBeenCalled();
    mockSend.mockRejectedValueOnce('unknown');
    await expect(provider.send(payload)).resolves.toMatchObject({
      status: 'failed',
      error: 'FCM push send failed',
    });
  });

  it('serializes minimal payloads and rejects non-array metadata tokens', () => {
    const privateProvider = provider as never as {
      extractDeviceTokens(metadata?: Record<string, unknown>): string[];
      serializeData(value: typeof payload): Record<string, string>;
    };
    expect(privateProvider.extractDeviceTokens()).toEqual([]);
    expect(
      privateProvider.extractDeviceTokens({ pushTokens: 'token' }),
    ).toEqual([]);
    expect(
      privateProvider.serializeData({ ...payload, templateKey: undefined }),
    ).toEqual({
      notificationId: 'n1',
      userId: 'u1',
    });
  });
});
