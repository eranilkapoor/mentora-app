import { FeatureFlagsService } from './feature-flags.service';

describe('FeatureFlagsService', () => {
  it('returns public feature flags without secrets', () => {
    const config = {
      get: jest.fn((key: string, fallback: unknown) => {
        const values: Record<string, unknown> = {
          'authMethods.emailPasswordEnabled': true,
          'authMethods.phoneOtpEnabled': true,
          'authMethods.magicLinkEnabled': false,
          'authSecurity.suspiciousLoginDetectionEnabled': true,
          'authMethods.social.google': true,
          'authMethods.social.facebook': false,
          'authMethods.social.apple': true,
          'payments.mobileStoreVerificationMode': 'strict',
          'payments.mobileStoreStrictVerificationEnabled': true,
          'payments.googlePlay.rtdn.enabled': true,
          'media.aiModerationEnabled': true,
          'monitoring.enabled': true,
          'monitoring.provider': 'sentry',
          'notification.queue.enabled': true,
          'notification.email.enabled': true,
          'notification.sms.enabled': false,
          'notification.push.enabled': true,
          'notification.email.provider': 'smtp',
          'notification.sms.provider': 'log',
          'notification.push.provider': 'fcm',
          'learning.sessionReminderEnabled': true,
          'learning.sessionReminderDryRun': false,
          'learning.entitlementAuditEnabled': true,
        };
        return values[key] ?? fallback;
      }),
    };

    const flags = new FeatureFlagsService(config as never).getPublicFlags();

    expect(flags).toMatchObject({
      auth: {
        emailPassword: true,
        phoneOtp: true,
        social: { google: true, facebook: false, apple: true },
      },
      billing: {
        mobileStoreVerificationMode: 'strict',
        strictMobileStoreVerification: true,
        googlePlayRtdn: true,
      },
      notifications: {
        queue: true,
        email: true,
        push: true,
        providers: { email: 'smtp', push: 'fcm' },
      },
      learning: {
        sessionReminders: true,
        sessionReminderDryRun: false,
        entitlementAudit: true,
      },
    });
    expect(JSON.stringify(flags)).not.toMatch(
      /secretKey|privateKey|serviceAccount|credential/i,
    );
  });
});
