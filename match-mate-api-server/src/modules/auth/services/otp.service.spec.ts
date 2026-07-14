import * as crypto from 'crypto';
import { HttpStatus } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import type { SmsNotificationProvider } from '@/modules/notifications/providers/sms-notification.provider';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { OtpService } from './otp.service';

jest.mock('crypto', () => ({
  ...jest.requireActual<typeof import('crypto')>('crypto'),
  randomInt: jest.fn(),
}));

describe('OtpService', () => {
  const configService = { get: jest.fn() };
  const smsProvider = { send: jest.fn() };
  const cache = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    setIfAbsent: jest.fn(),
    incrementWithExpiry: jest.fn(),
    consumeIfValueMatches: jest.fn(),
  };
  const randomInt = crypto.randomInt as unknown as jest.Mock;
  let service: OtpService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    randomInt.mockReturnValue(123456);
    configService.get.mockImplementation((key: string, fallback?: string) => {
      if (key === 'env') return 'development';
      if (key === 'jwt.secret') return 'test-otp-pepper';
      return fallback;
    });
    cache.setIfAbsent.mockResolvedValue(true);
    cache.set.mockResolvedValue(undefined);
    cache.del.mockResolvedValue(undefined);
    cache.incrementWithExpiry.mockResolvedValue({
      value: 1,
      ttlSeconds: 300,
    });
    cache.consumeIfValueMatches.mockResolvedValue(true);
    smsProvider.send.mockResolvedValue({ status: 'sent', provider: 'msg91' });
    service = new OtpService(
      configService as unknown as ConfigService,
      smsProvider as unknown as SmsNotificationProvider,
      cache as unknown as ICacheService,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it('stores only a hashed, purpose-bound OTP and sends the plaintext to SMS', async () => {
    await expect(
      service.generate('91', '9876543210', 'two-factor-login', 'challenge-1'),
    ).resolves.toBe('123456');

    const [otpKey, storedHash, ttl] = cache.set.mock.calls[0] as [
      string,
      string,
      number,
    ];
    expect(otpKey).toMatch(
      /^auth:otp:two-factor-login:challenge-1:[a-f0-9]{64}$/,
    );
    expect(otpKey).not.toContain('9876543210');
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/);
    expect(storedHash).not.toBe('123456');
    expect(ttl).toBe(300);
    expect(smsProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+919876543210',
        message: 'Match Mate OTP: 123456. Valid for 5 minutes.',
      }),
    );
  });

  it('atomically consumes a valid OTP and rejects replay', async () => {
    await service.generate('91', '9876543210');
    const [otpKey, storedHash] = cache.set.mock.calls[0] as [string, string];
    cache.get.mockResolvedValue(storedHash);

    await expect(service.verify('91', '9876543210', '123456')).resolves.toBe(
      true,
    );
    expect(cache.consumeIfValueMatches).toHaveBeenCalledWith(
      otpKey,
      storedHash,
    );

    cache.consumeIfValueMatches.mockResolvedValue(false);
    await expect(service.verify('91', '9876543210', '123456')).resolves.toBe(
      false,
    );
  });

  it('counts invalid attempts and invalidates the OTP at the attempt cap', async () => {
    cache.get.mockResolvedValue('not-the-submitted-hash');
    cache.incrementWithExpiry.mockResolvedValue({
      value: 5,
      ttlSeconds: 120,
    });

    await expect(service.verify('91', '9876543210', '000000')).resolves.toBe(
      false,
    );

    expect(cache.incrementWithExpiry).toHaveBeenCalledWith(
      expect.stringContaining(':attempts'),
      300,
    );
    expect(cache.del).toHaveBeenCalledWith(
      expect.stringMatching(/^auth:otp:phone-login:direct:/),
    );
  });

  it('enforces the resend cooldown before sending another OTP', async () => {
    cache.setIfAbsent.mockResolvedValue(false);

    await expect(service.generate('91', '9876543210')).rejects.toMatchObject({
      code: ErrorCode.AUTH_OTP_LIMIT_EXCEEDED,
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(smsProvider.send).not.toHaveBeenCalled();
  });

  it('uses the configured reusable OTP only for the exact phone reviewer', async () => {
    configService.get.mockImplementation((key: string, fallback?: string) => {
      const values: Record<string, string | boolean> = {
        env: 'production',
        'jwt.secret': 'test-otp-pepper',
        'authSecurity.reviewPhoneOtp.enabled': true,
        'authSecurity.reviewPhoneOtp.countryCode': '91',
        'authSecurity.reviewPhoneOtp.phone': '9876543210',
        'authSecurity.reviewPhoneOtp.otp': '123456',
      };
      return values[key] ?? fallback;
    });
    randomInt.mockReturnValue(654321);

    await expect(service.generate('+91', '9876543210')).resolves.toBe('123456');
    expect(smsProvider.send).not.toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.stringContaining('123456'),
      300,
    );

    await service.generate('91', '9999999999');
    expect(smsProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: '+919999999999' }),
    );
  });

  it('removes OTP state when production delivery fails', async () => {
    configService.get.mockImplementation((key: string, fallback?: string) => {
      if (key === 'env') return 'production';
      if (key === 'jwt.secret') return 'test-otp-pepper';
      return fallback;
    });
    smsProvider.send.mockResolvedValue({
      status: 'failed',
      provider: 'msg91',
      error: 'rejected',
    });

    const error = (await service
      .generate('91', '9876543210')
      .catch((caught: unknown) => caught)) as AppException;
    expect(error.code).toBe(ErrorCode.SMS_SERVICE_FAILED);
    expect(cache.del).toHaveBeenCalledTimes(4);
  });

  it('relies on cache TTL cleanup and exposes OTPs only outside production', () => {
    expect(service.cleanupExpiredOtps()).toEqual({
      removedCount: 0,
      remainingCount: 0,
    });
    expect(service.shouldExposeOtpForEnvironment()).toBe(true);
  });
});
