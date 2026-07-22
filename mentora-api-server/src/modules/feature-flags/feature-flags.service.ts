import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PublicFeatureFlags {
  auth: {
    emailPassword: boolean;
    phoneOtp: boolean;
    magicLink: boolean;
    suspiciousLoginDetection: boolean;
    social: {
      google: boolean;
      facebook: boolean;
      apple: boolean;
    };
  };
  billing: {
    mobileStoreVerificationMode: string;
    strictMobileStoreVerification: boolean;
    googlePlayRtdn: boolean;
  };
  media: {
    aiModeration: boolean;
  };
  monitoring: {
    enabled: boolean;
    provider: string;
  };
  notifications: {
    queue: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    providers: {
      email: string;
      sms: string;
      push: string;
    };
  };
  learning: {
    sessionReminders: boolean;
    sessionReminderDryRun: boolean;
    entitlementAudit: boolean;
  };
}

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly configService: ConfigService) {}

  getPublicFlags(): PublicFeatureFlags {
    return {
      auth: {
        emailPassword: this.configService.get<boolean>(
          'authMethods.emailPasswordEnabled',
          true,
        ),
        phoneOtp: this.configService.get<boolean>(
          'authMethods.phoneOtpEnabled',
          false,
        ),
        magicLink: this.configService.get<boolean>(
          'authMethods.magicLinkEnabled',
          false,
        ),
        suspiciousLoginDetection: this.configService.get<boolean>(
          'authSecurity.suspiciousLoginDetectionEnabled',
          true,
        ),
        social: {
          google: this.configService.get<boolean>(
            'authMethods.social.google',
            false,
          ),
          facebook: this.configService.get<boolean>(
            'authMethods.social.facebook',
            false,
          ),
          apple: this.configService.get<boolean>(
            'authMethods.social.apple',
            false,
          ),
        },
      },
      billing: {
        mobileStoreVerificationMode: this.configService.get<string>(
          'payments.mobileStoreVerificationMode',
          'sandbox',
        ),
        strictMobileStoreVerification: this.configService.get<boolean>(
          'payments.mobileStoreStrictVerificationEnabled',
          false,
        ),
        googlePlayRtdn: this.configService.get<boolean>(
          'payments.googlePlay.rtdn.enabled',
          false,
        ),
      },
      media: {
        aiModeration: this.configService.get<boolean>(
          'media.aiModerationEnabled',
          false,
        ),
      },
      monitoring: {
        enabled: this.configService.get<boolean>('monitoring.enabled', false),
        provider: this.configService.get<string>('monitoring.provider', 'log'),
      },
      notifications: {
        queue: this.configService.get<boolean>(
          'notification.queue.enabled',
          false,
        ),
        email: this.configService.get<boolean>(
          'notification.email.enabled',
          false,
        ),
        sms: this.configService.get<boolean>('notification.sms.enabled', false),
        push: this.configService.get<boolean>(
          'notification.push.enabled',
          false,
        ),
        providers: {
          email: this.configService.get<string>(
            'notification.email.provider',
            'log',
          ),
          sms: this.configService.get<string>(
            'notification.sms.provider',
            'log',
          ),
          push: this.configService.get<string>(
            'notification.push.provider',
            'log',
          ),
        },
      },
      learning: {
        sessionReminders: this.configService.get<boolean>(
          'learning.sessionReminderEnabled',
          true,
        ),
        sessionReminderDryRun: this.configService.get<boolean>(
          'learning.sessionReminderDryRun',
          false,
        ),
        entitlementAudit: this.configService.get<boolean>(
          'learning.entitlementAuditEnabled',
          true,
        ),
      },
    };
  }
}
