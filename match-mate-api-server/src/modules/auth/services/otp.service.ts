import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomInt } from 'crypto';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { SmsNotificationProvider } from '@/modules/notifications/providers/sms-notification.provider';

export type OtpPurpose =
  | 'phone-login'
  | 'two-factor-enable'
  | 'two-factor-login';

@Injectable()
export class OtpService {
  private readonly otpTtlSeconds = 5 * 60;
  private readonly resendCooldownSeconds = 60;
  private readonly maxAttempts = 5;

  constructor(
    private readonly configService: ConfigService,
    private readonly smsProvider: SmsNotificationProvider,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async generate(
    countryCode: string,
    phone: string,
    purpose: OtpPurpose = 'phone-login',
    challengeId = 'direct',
  ) {
    const keys = this.getKeys(countryCode, phone, purpose, challengeId);
    const cooldownAcquired = await this.cache.setIfAbsent(
      keys.cooldown,
      true,
      this.resendCooldownSeconds,
    );
    if (!cooldownAcquired) {
      throw new AppException(
        ErrorCode.AUTH_OTP_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS,
        null,
        undefined,
        { reason: 'otp_resend_cooldown' },
      );
    }

    const reviewOtp = this.getReviewOtp(
      countryCode,
      phone,
      purpose,
      challengeId,
    );
    const otp = reviewOtp ?? randomInt(100000, 1000000).toString();
    await this.cache.set(
      keys.otp,
      this.hashOtp(keys.otp, otp),
      this.otpTtlSeconds,
    );
    await this.cache.del(keys.attempts);

    const deliveryResult = reviewOtp
      ? { status: 'sent' as const, provider: 'review-access' }
      : await this.smsProvider.send({
          userId: 'otp',
          to: `+${countryCode}${phone}`,
          message: `Match Mate OTP: ${otp}. Valid for 5 minutes.`,
          notificationId: `otp-${Date.now()}`,
          templateKey: 'auth.phone_otp',
          metadata: {
            msg91TemplateId: this.configService.get<string>(
              'notification.sms.msg91.otpTemplateId',
              '',
            ),
            msg91Variables: {
              OTP: otp,
              EXPIRY: '5',
            },
          },
        });

    if (
      !this.shouldExposeOtpForEnvironment() &&
      deliveryResult.status !== 'sent'
    ) {
      await Promise.all([
        this.cache.del(keys.otp),
        this.cache.del(keys.attempts),
        this.cache.del(keys.cooldown),
      ]);
      throw new AppException(
        ErrorCode.SMS_SERVICE_FAILED,
        HttpStatus.SERVICE_UNAVAILABLE,
        null,
        undefined,
        {
          provider: deliveryResult.provider,
          reason: deliveryResult.error ?? 'otp_sms_not_sent',
        },
      );
    }

    return otp;
  }

  async verify(
    countryCode: string,
    phone: string,
    otp: string,
    purpose: OtpPurpose = 'phone-login',
    challengeId = 'direct',
  ): Promise<boolean> {
    const keys = this.getKeys(countryCode, phone, purpose, challengeId);
    const expectedHash = await this.cache.get<string>(keys.otp);
    if (!expectedHash) return false;

    const submittedHash = this.hashOtp(keys.otp, otp);
    if (submittedHash !== expectedHash) {
      const attempts = await this.cache.incrementWithExpiry(
        keys.attempts,
        this.otpTtlSeconds,
      );
      if (attempts.value >= this.maxAttempts) {
        await this.cache.del(keys.otp);
      }
      return false;
    }

    const consumed = await this.cache.consumeIfValueMatches(
      keys.otp,
      expectedHash,
    );
    if (consumed) {
      await this.cache.del(keys.attempts);
    }
    return consumed;
  }

  cleanupExpiredOtps() {
    return { removedCount: 0, remainingCount: 0 };
  }

  shouldExposeOtpForEnvironment(): boolean {
    return this.configService.get<string>('env') !== 'production';
  }

  private getKeys(
    countryCode: string,
    phone: string,
    purpose: OtpPurpose,
    challengeId: string,
  ) {
    const destination = `${countryCode.replace(/\D/g, '')}|${phone.replace(/\D/g, '')}`;
    const destinationHash = createHash('sha256')
      .update(destination)
      .digest('hex');
    const base = `auth:otp:${purpose}:${challengeId}:${destinationHash}`;
    return {
      otp: base,
      attempts: `${base}:attempts`,
      cooldown: `${base}:cooldown`,
    };
  }

  private hashOtp(key: string, otp: string): string {
    const pepper = this.configService.get<string>(
      'jwt.secret',
      'local-otp-pepper-not-for-production',
    );
    return createHmac('sha256', pepper).update(`${key}:${otp}`).digest('hex');
  }

  private getReviewOtp(
    countryCode: string,
    phone: string,
    purpose: OtpPurpose,
    challengeId: string,
  ): string | undefined {
    if (
      purpose !== 'phone-login' ||
      challengeId !== 'direct' ||
      !this.configService.get<boolean>('authSecurity.reviewPhoneOtp.enabled')
    ) {
      return undefined;
    }

    const digitsOnly = (value: string): string => value.replace(/\D/g, '');
    const configuredCountryCode = digitsOnly(
      this.configService.get<string>(
        'authSecurity.reviewPhoneOtp.countryCode',
        '',
      ),
    );
    const configuredPhone = digitsOnly(
      this.configService.get<string>('authSecurity.reviewPhoneOtp.phone', ''),
    );

    if (
      digitsOnly(countryCode) !== configuredCountryCode ||
      digitsOnly(phone) !== configuredPhone
    ) {
      return undefined;
    }

    const otp = this.configService.get<string>(
      'authSecurity.reviewPhoneOtp.otp',
      '',
    );
    return /^\d{6}$/.test(otp) ? otp : undefined;
  }
}
