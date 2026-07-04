import {
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { GooglePlayRtdnService } from './google-play-rtdn.service';
import { SubscriptionStatus } from '@/common/enums';

describe('GooglePlayRtdnService', () => {
  const config = new Map<string, unknown>([
    ['payments.googlePlay.rtdn.enabled', true],
    [
      'payments.googlePlay.rtdn.audience',
      'https://matchmate.webnza.com/api/v1/payments/google-play/rtdn',
    ],
    [
      'payments.googlePlay.rtdn.serviceAccountEmail',
      'matchmate-rtdn-push@project.iam.gserviceaccount.com',
    ],
    ['payments.googlePlay.packageName', 'com.webnza.matchmate'],
  ]);
  const configService = {
    get: jest.fn((key: string) => config.get(key)),
    getOrThrow: jest.fn((key: string) => {
      const value = config.get(key);
      if (value === undefined) throw new Error(`missing ${key}`);
      return value;
    }),
  };
  const storeVerifier = { getGooglePlayLifecycle: jest.fn() };
  const subscriptionsService = {
    reconcileGooglePlayLifecycle: jest.fn(),
    revokeGooglePlayEntitlement: jest.fn(),
  };
  const notification = (payload: Record<string, unknown>) => ({
    message: {
      data: Buffer.from(JSON.stringify(payload)).toString('base64'),
      messageId: 'message-1',
    },
  });
  let service: GooglePlayRtdnService;

  beforeEach(() => {
    jest.clearAllMocks();
    config.set('payments.googlePlay.rtdn.enabled', true);
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        email_verified: true,
        email: 'matchmate-rtdn-push@project.iam.gserviceaccount.com',
      }),
    } as never);
    service = new GooglePlayRtdnService(
      configService as never,
      storeVerifier as never,
      subscriptionsService as never,
    );
  });

  it('accepts authenticated test notifications without reconciliation', async () => {
    await expect(
      service.process(
        'Bearer signed-token',
        notification({
          packageName: 'com.webnza.matchmate',
          testNotification: { version: '1.0' },
        }),
      ),
    ).resolves.toBeUndefined();
    expect(storeVerifier.getGooglePlayLifecycle).not.toHaveBeenCalled();
  });

  it('reconciles subscription notifications from authoritative Play state', async () => {
    const lifecycle = {
      productId: 'matchmate_gold',
      expiresAt: new Date(Date.now() + 86_400_000),
      autoRenew: true,
      status: SubscriptionStatus.ACTIVE,
      providerPayload: {},
    };
    storeVerifier.getGooglePlayLifecycle.mockResolvedValue(lifecycle);
    subscriptionsService.reconcileGooglePlayLifecycle.mockResolvedValue({
      _id: 'subscription-1',
    });

    await service.process(
      'Bearer signed-token',
      notification({
        packageName: 'com.webnza.matchmate',
        subscriptionNotification: {
          notificationType: 2,
          purchaseToken: 'purchase-token',
          subscriptionId: 'matchmate_gold',
        },
      }),
    );

    expect(storeVerifier.getGooglePlayLifecycle).toHaveBeenCalledWith(
      'purchase-token',
      'matchmate_gold',
    );
    expect(
      subscriptionsService.reconcileGooglePlayLifecycle,
    ).toHaveBeenCalledWith('purchase-token', lifecycle);
  });

  it('asks Pub/Sub to retry notifications received before client claim', async () => {
    storeVerifier.getGooglePlayLifecycle.mockResolvedValue({});
    subscriptionsService.reconcileGooglePlayLifecycle.mockResolvedValue(null);

    await expect(
      service.process(
        'Bearer signed-token',
        notification({
          packageName: 'com.webnza.matchmate',
          subscriptionNotification: { purchaseToken: 'purchase-token' },
        }),
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('revokes entitlement immediately for voided purchases', async () => {
    subscriptionsService.revokeGooglePlayEntitlement.mockResolvedValue({
      _id: 'subscription-1',
    });
    await service.process(
      'Bearer token',
      notification({
        packageName: 'com.webnza.matchmate',
        voidedPurchaseNotification: {
          purchaseToken: 'purchase-token',
          refundType: 1,
        },
      }),
    );
    expect(
      subscriptionsService.revokeGooglePlayEntitlement,
    ).toHaveBeenCalledWith('purchase-token', 'google_play_voided_purchase:1');
    expect(storeVerifier.getGooglePlayLifecycle).not.toHaveBeenCalled();
  });

  it('rejects disabled, unauthenticated, wrong-package, and malformed pushes', async () => {
    config.set('payments.googlePlay.rtdn.enabled', false);
    await expect(
      service.process('Bearer token', notification({})),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    config.set('payments.googlePlay.rtdn.enabled', true);

    await expect(
      service.process(undefined, notification({})),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.process(
        'Bearer token',
        notification({ packageName: 'wrong.package' }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.process('Bearer token', { message: { data: 'not-json' } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unexpected or unverifiable push identities', async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ email_verified: false, email: 'wrong@example.com' }),
    } as never);
    await expect(
      service.process('Bearer token', notification({})),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    jest
      .spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockRejectedValue(new Error('invalid signature') as never);
    await expect(
      service.process('Bearer token', notification({})),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('acknowledges unrelated product notifications after authentication', async () => {
    await expect(
      service.process(
        'Bearer token',
        notification({
          packageName: 'com.webnza.matchmate',
          oneTimeProductNotification: { sku: 'boost' },
        }),
      ),
    ).resolves.toBeUndefined();
  });
});
