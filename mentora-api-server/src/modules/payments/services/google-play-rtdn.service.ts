import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GooglePlayRtdnEnvelopeDto } from '../dto/google-play-rtdn-envelope.dto';
import { StoreReceiptVerifierService } from './store-receipt-verifier.service';
import { SubscriptionsService } from '@/modules/subscriptions/services/subscriptions.service';

interface GooglePlayDeveloperNotification {
  packageName?: string;
  eventTimeMillis?: string;
  testNotification?: { version?: string };
  subscriptionNotification?: {
    version?: string;
    notificationType?: number;
    purchaseToken?: string;
    subscriptionId?: string;
  };
  voidedPurchaseNotification?: {
    purchaseToken?: string;
    orderId?: string;
    productType?: number;
    refundType?: number;
  };
}

@Injectable()
export class GooglePlayRtdnService {
  private readonly oauthClient = new OAuth2Client();

  constructor(
    private readonly configService: ConfigService,
    private readonly storeVerifier: StoreReceiptVerifierService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async process(
    authorization: string | undefined,
    envelope: GooglePlayRtdnEnvelopeDto,
  ): Promise<void> {
    if (!this.configService.get<boolean>('payments.googlePlay.rtdn.enabled')) {
      throw new ServiceUnavailableException('Google Play RTDN is disabled');
    }

    await this.verifyPushIdentity(authorization);
    const notification = this.decodeNotification(envelope);
    const packageName = this.configService.getOrThrow<string>(
      'payments.googlePlay.packageName',
    );
    if (notification.packageName !== packageName) {
      throw new BadRequestException('Google Play package mismatch');
    }

    if (notification.testNotification) return;

    const subscriptionEvent = notification.subscriptionNotification;
    const voidedEvent = notification.voidedPurchaseNotification;
    const purchaseToken =
      subscriptionEvent?.purchaseToken ?? voidedEvent?.purchaseToken;
    if (!purchaseToken) {
      // One-time-product notifications are intentionally out of scope.
      return;
    }

    if (voidedEvent) {
      const revoked =
        await this.subscriptionsService.revokeGooglePlayEntitlement(
          purchaseToken,
          `google_play_voided_purchase:${voidedEvent.refundType ?? 'unknown'}`,
        );
      if (!revoked) {
        throw new ServiceUnavailableException(
          'Google Play subscription has not been claimed yet',
        );
      }
      return;
    }

    const lifecycle = await this.storeVerifier.getGooglePlayLifecycle(
      purchaseToken,
      subscriptionEvent?.subscriptionId,
    );
    const reconciled =
      await this.subscriptionsService.reconcileGooglePlayLifecycle(
        purchaseToken,
        lifecycle,
      );
    if (!reconciled) {
      // Returning a non-2xx response asks Pub/Sub to retry if the notification
      // arrived before the mobile client finished claiming the purchase.
      throw new ServiceUnavailableException(
        'Google Play subscription has not been claimed yet',
      );
    }
  }

  private async verifyPushIdentity(
    authorization: string | undefined,
  ): Promise<void> {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException('Missing Pub/Sub bearer token');

    const audience = this.configService.getOrThrow<string>(
      'payments.googlePlay.rtdn.audience',
    );
    const expectedEmail = this.configService.getOrThrow<string>(
      'payments.googlePlay.rtdn.serviceAccountEmail',
    );
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience,
      });
      const payload = ticket.getPayload();
      if (
        !payload?.email_verified ||
        payload.email?.toLowerCase() !== expectedEmail.toLowerCase()
      ) {
        throw new Error('unexpected_push_identity');
      }
    } catch {
      throw new UnauthorizedException('Invalid Pub/Sub identity token');
    }
  }

  private decodeNotification(
    envelope: GooglePlayRtdnEnvelopeDto,
  ): GooglePlayDeveloperNotification {
    if (!envelope.message?.data) {
      throw new BadRequestException('Pub/Sub message data is required');
    }
    try {
      return JSON.parse(
        Buffer.from(envelope.message.data, 'base64').toString('utf8'),
      ) as GooglePlayDeveloperNotification;
    } catch {
      throw new BadRequestException('Invalid Google Play notification data');
    }
  }
}
