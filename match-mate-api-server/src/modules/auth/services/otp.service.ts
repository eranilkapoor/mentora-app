import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { ErrorCode } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { SmsNotificationProvider } from '@/modules/notifications/providers/sms-notification.provider';

type StoredOtp = {
  code: string;
  expiresAt: number;
};

@Injectable()
export class OtpService {
  private readonly otpStore = new Map<string, StoredOtp>();
  private readonly otpTtlMs = 5 * 60 * 1000;

  constructor(
    private readonly configService: ConfigService,
    private readonly smsProvider: SmsNotificationProvider,
  ) {}

  async generate(country_code: string, phone: string) {
    const otp = randomInt(100000, 1000000).toString();
    this.otpStore.set(this.getKey(country_code, phone), {
      code: otp,
      expiresAt: Date.now() + this.otpTtlMs,
    });

    const deliveryResult = await this.smsProvider.send({
      userId: 'otp',
      to: `+${country_code}${phone}`,
      message: `MatchMate OTP: ${otp}. Valid for 5 minutes.`,
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
      this.otpStore.delete(this.getKey(country_code, phone));
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

  verify(country_code: string, phone: string, otp: string) {
    const key = this.getKey(country_code, phone);
    const storedOtp = this.otpStore.get(key);

    if (!storedOtp) {
      return false;
    }

    if (Date.now() > storedOtp.expiresAt) {
      this.otpStore.delete(key);
      return false;
    }

    const isValid = storedOtp.code === otp;

    if (isValid) {
      this.otpStore.delete(key);
    }

    return isValid;
  }

  cleanupExpiredOtps(now = Date.now()) {
    let removedCount = 0;

    for (const [key, storedOtp] of this.otpStore.entries()) {
      if (now > storedOtp.expiresAt) {
        this.otpStore.delete(key);
        removedCount += 1;
      }
    }

    return { removedCount, remainingCount: this.otpStore.size };
  }

  shouldExposeOtpForEnvironment(): boolean {
    return this.configService.get<string>('env') !== 'production';
  }

  private getKey(country_code: string, phone: string): string {
    return `${country_code}|${phone}`;
  }
}
