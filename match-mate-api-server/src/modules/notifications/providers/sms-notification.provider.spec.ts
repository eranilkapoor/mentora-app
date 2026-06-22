import { ConfigService } from '@nestjs/config';
import type { AppLogger } from '@/common/logger/logger.service';
import { SmsNotificationProvider } from './sms-notification.provider';

const createProvider = (overrides: Record<string, unknown> = {}) => {
  const config = new ConfigService({
    notification: {
      sms: {
        enabled: true,
        provider: 'msg91',
        msg91: {
          authKey: 'test-auth-key',
          templateId: 'default-template',
          baseUrl: 'https://control.msg91.com',
          timeoutMs: 5000,
        },
      },
    },
    ...overrides,
  });
  const loggerError = jest.fn();
  const logger = {
    error: loggerError,
    log: jest.fn(),
  } as unknown as AppLogger;

  return {
    provider: new SmsNotificationProvider(config, logger),
    loggerError,
  };
};

describe('SmsNotificationProvider MSG91', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends approved template variables to normalized recipients', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'success',
          message: 'SMS request sent',
          request_id: 'request-1',
        }),
        { status: 200 },
      ),
    );
    const { provider } = createProvider();

    const result = await provider.send({
      notificationId: 'otp-1',
      userId: 'user-1',
      to: '+91 98765-43210',
      message: 'Fallback message',
      templateKey: 'auth.phone_otp',
      metadata: {
        msg91TemplateId: 'otp-template',
        msg91Variables: { OTP: '123456', EXPIRY: '5' },
      },
    });

    expect(result).toMatchObject({
      status: 'sent',
      provider: 'msg91',
      providerResponse: 'request-1',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://control.msg91.com/api/v5/flow/');
    expect(init?.headers).toMatchObject({ authkey: 'test-auth-key' });
    expect(init?.body).toBe(
      JSON.stringify({
        template_id: 'otp-template',
        short_url: '0',
        recipients: [
          {
            mobiles: '919876543210',
            MESSAGE: 'Fallback message',
            OTP: '123456',
            EXPIRY: '5',
          },
        ],
      }),
    );
  });

  it('returns a failed result when MSG91 rejects the request', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ type: 'error', message: 'Invalid template id' }),
          { status: 400 },
        ),
      );
    const { provider, loggerError } = createProvider();

    const result = await provider.send({
      notificationId: 'notification-1',
      userId: 'user-1',
      to: '+919876543210',
      message: 'Hello',
    });

    expect(result).toMatchObject({
      status: 'failed',
      provider: 'msg91',
      error: 'Invalid template id',
    });
    expect(loggerError.mock.calls).toHaveLength(1);
  });

  it('fails before making a request when credentials are missing', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const { provider } = createProvider({
      notification: {
        sms: {
          enabled: true,
          provider: 'msg91',
          msg91: {},
        },
      },
    });

    await expect(
      provider.send({
        notificationId: 'notification-1',
        userId: 'user-1',
        to: '+919876543210',
        message: 'Hello',
      }),
    ).resolves.toMatchObject({
      status: 'failed',
      error: 'MSG91 auth key and template ID are required',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
