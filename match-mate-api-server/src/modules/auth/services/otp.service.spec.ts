import * as crypto from 'crypto';
import { HttpStatus } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import type { SmsNotificationProvider } from '@/modules/notifications/providers/sms-notification.provider';
import { OtpService } from './otp.service';

jest.mock('crypto', () => ({ randomInt: jest.fn() }));

describe('OtpService', () => {
  const configService = { get: jest.fn() };
  const smsProvider = { send: jest.fn() };
  const randomInt = crypto.randomInt as unknown as jest.Mock;
  let now: jest.SpyInstance<number, []>;
  let service: OtpService;

  beforeEach(() => {
    jest.clearAllMocks();
    randomInt.mockReturnValue(123456);
    now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    configService.get.mockImplementation((key: string, fallback?: string) => {
      if (key === 'env') return 'development';
      return fallback;
    });
    smsProvider.send.mockResolvedValue({
      status: 'sent',
      provider: 'msg91',
    });
    service = new OtpService(
      configService as unknown as ConfigService,
      smsProvider as unknown as SmsNotificationProvider,
    );
  });

  afterEach(() => {
    now.mockRestore();
  });

  it('generates, sends and verifies a one-time password once', async () => {
    configService.get.mockImplementation((key: string) =>
      key === 'env' ? 'production' : 'template-id',
    );

    await expect(service.generate('91', '9876543210')).resolves.toBe('123456');
    expect(smsProvider.send).toHaveBeenCalledWith({
      userId: 'otp',
      to: '+919876543210',
      message: 'Match Mate OTP: 123456. Valid for 5 minutes.',
      notificationId: 'otp-1000000',
      templateKey: 'auth.phone_otp',
      metadata: {
        msg91TemplateId: 'template-id',
        msg91Variables: { OTP: '123456', EXPIRY: '5' },
      },
    });
    expect(service.verify('91', '9876543210', '000000')).toBe(false);
    expect(service.verify('91', '9876543210', '123456')).toBe(true);
    expect(service.verify('91', '9876543210', '123456')).toBe(false);
  });

  it('allows a failed delivery in non-production for local testing', async () => {
    smsProvider.send.mockResolvedValue({
      status: 'failed',
      provider: 'msg91',
      error: 'provider unavailable',
    });

    await expect(service.generate('91', '9000000000')).resolves.toBe('123456');
    expect(service.shouldExposeOtpForEnvironment()).toBe(true);
  });

  it.each([
    { error: 'rejected', expectedReason: 'rejected' },
    { error: undefined, expectedReason: 'otp_sms_not_sent' },
  ])(
    'removes the OTP and rejects failed production delivery',
    async ({ error: providerError, expectedReason }) => {
      configService.get.mockImplementation((key: string) =>
        key === 'env' ? 'production' : '',
      );
      smsProvider.send.mockResolvedValue({
        status: 'failed',
        provider: 'msg91',
        error: providerError,
      });

      const caughtError = (await service
        .generate('91', '9111111111')
        .catch((caught: unknown) => caught)) as AppException;
      expect(caughtError).toBeInstanceOf(AppException);
      expect(caughtError.code).toBe(ErrorCode.SMS_SERVICE_FAILED);
      expect(caughtError.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(caughtError.meta).toEqual({
        provider: 'msg91',
        reason: expectedReason,
      });
      expect(service.verify('91', '9111111111', '123456')).toBe(false);
      expect(service.shouldExposeOtpForEnvironment()).toBe(false);
    },
  );

  it('rejects expired OTPs and cleans only expired entries', async () => {
    await service.generate('91', '9222222222');
    await service.generate('91', '9333333333');
    now.mockReturnValue(1_300_001);

    expect(service.verify('91', '9222222222', '123456')).toBe(false);
    expect(service.cleanupExpiredOtps()).toEqual({
      removedCount: 1,
      remainingCount: 0,
    });
  });

  it('leaves unexpired OTPs during cleanup', async () => {
    await service.generate('91', '9444444444');

    expect(service.cleanupExpiredOtps(1_299_999)).toEqual({
      removedCount: 0,
      remainingCount: 1,
    });
  });
});
