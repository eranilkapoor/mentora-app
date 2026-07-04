import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSign } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { VerifyStoreSubscriptionDto } from '../dto/verify-store-subscription.dto';
import { SubscriptionStatus } from '@/common/enums';

export interface VerifiedStoreSubscription {
  productId: string;
  basePlanId?: string;
  offerId?: string;
  transactionId: string;
  originalTransactionId?: string;
  expiresAt: Date;
  autoRenew: boolean;
  environment: string;
  providerPayload: Record<string, unknown>;
  status: SubscriptionStatus.ACTIVE | SubscriptionStatus.GRACE_PERIOD;
  acknowledgementState?: string;
}

export interface GooglePlaySubscriptionLifecycle {
  productId: string;
  basePlanId?: string;
  offerId?: string;
  transactionId?: string;
  expiresAt: Date;
  autoRenew: boolean;
  status: SubscriptionStatus;
  subscriptionState?: string;
  acknowledgementState?: string;
  providerPayload: Record<string, unknown>;
}

@Injectable()
export class StoreReceiptVerifierService {
  constructor(private readonly configService: ConfigService) {}

  async verify(
    dto: VerifyStoreSubscriptionDto,
  ): Promise<VerifiedStoreSubscription> {
    return dto.gateway === PaymentGateway.GOOGLE_PLAY
      ? this.verifyGooglePlay(dto)
      : this.verifyApple(dto);
  }

  private async verifyGooglePlay(
    dto: VerifyStoreSubscriptionDto,
  ): Promise<VerifiedStoreSubscription> {
    const lifecycle = await this.getGooglePlayLifecycle(
      dto.purchaseToken!,
      dto.productId,
      dto.basePlanId,
    );
    if (
      ![SubscriptionStatus.ACTIVE, SubscriptionStatus.GRACE_PERIOD].includes(
        lifecycle.status,
      ) ||
      lifecycle.expiresAt <= new Date()
    ) {
      throw new Error('google_subscription_not_entitled');
    }

    return {
      ...lifecycle,
      transactionId: lifecycle.transactionId ?? dto.transactionId,
      environment: 'production',
      status: lifecycle.status as
        | SubscriptionStatus.ACTIVE
        | SubscriptionStatus.GRACE_PERIOD,
    };
  }

  async getGooglePlayLifecycle(
    purchaseToken: string,
    expectedProductId?: string,
    expectedBasePlanId?: string,
  ): Promise<GooglePlaySubscriptionLifecycle> {
    const packageName = this.required('payments.googlePlay.packageName');
    const serviceAccount = this.parseServiceAccount(
      this.required('payments.googlePlay.serviceAccountJson'),
    );
    const accessToken = await this.getGoogleAccessToken(serviceAccount);
    const token = encodeURIComponent(purchaseToken);
    const response = await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${token}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`google_play_permission_denied_${response.status}`);
      }
      throw new Error(`google_verification_${response.status}`);
    }

    const body = (await response.json()) as {
      subscriptionState?: string;
      acknowledgementState?: string;
      latestOrderId?: string;
      regionCode?: string;
      lineItems?: Array<{
        productId?: string;
        expiryTime?: string;
        offerDetails?: { basePlanId?: string; offerId?: string };
        autoRenewingPlan?: { autoRenewEnabled?: boolean };
      }>;
    };
    const lineItem =
      body.lineItems?.find(
        (item) =>
          (!expectedProductId || item.productId === expectedProductId) &&
          (!expectedBasePlanId ||
            item.offerDetails?.basePlanId === expectedBasePlanId),
      ) ?? body.lineItems?.[0];
    const expiresAt = new Date(lineItem?.expiryTime ?? 0);
    if (!lineItem?.productId || Number.isNaN(expiresAt.getTime())) {
      throw new Error('google_subscription_not_entitled');
    }

    if (
      (expectedProductId && lineItem.productId !== expectedProductId) ||
      (expectedBasePlanId &&
        lineItem.offerDetails?.basePlanId !== expectedBasePlanId)
    ) {
      throw new Error('google_subscription_product_mismatch');
    }

    const subscriptionState = body.subscriptionState ?? '';
    const futureEntitlement = expiresAt > new Date();
    const status =
      subscriptionState === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'
        ? SubscriptionStatus.GRACE_PERIOD
        : subscriptionState === 'SUBSCRIPTION_STATE_ACTIVE' ||
            (subscriptionState === 'SUBSCRIPTION_STATE_CANCELED' &&
              futureEntitlement)
          ? SubscriptionStatus.ACTIVE
          : subscriptionState === 'SUBSCRIPTION_STATE_EXPIRED' ||
              subscriptionState ===
                'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED'
            ? SubscriptionStatus.EXPIRED
            : SubscriptionStatus.PENDING;

    return {
      productId: lineItem.productId,
      basePlanId: lineItem.offerDetails?.basePlanId,
      offerId: lineItem.offerDetails?.offerId,
      transactionId: body.latestOrderId,
      expiresAt,
      autoRenew: Boolean(lineItem.autoRenewingPlan?.autoRenewEnabled),
      status,
      subscriptionState,
      acknowledgementState: body.acknowledgementState,
      providerPayload: {
        subscriptionState: body.subscriptionState,
        acknowledgementState: body.acknowledgementState,
        regionCode: body.regionCode,
      },
    };
  }

  async acknowledgeGooglePlay(dto: VerifyStoreSubscriptionDto): Promise<void> {
    if (dto.gateway !== PaymentGateway.GOOGLE_PLAY || !dto.purchaseToken) {
      return;
    }

    const packageName = this.required('payments.googlePlay.packageName');
    const serviceAccount = this.parseServiceAccount(
      this.required('payments.googlePlay.serviceAccountJson'),
    );
    const accessToken = await this.getGoogleAccessToken(serviceAccount);
    const response = await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptions/${encodeURIComponent(dto.productId)}/tokens/${encodeURIComponent(dto.purchaseToken)}:acknowledge`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    // Google returns 409 when another retry/client acknowledged concurrently.
    if (!response.ok && response.status !== 409) {
      throw new Error(`google_acknowledgement_${response.status}`);
    }
  }

  private async verifyApple(
    dto: VerifyStoreSubscriptionDto,
  ): Promise<VerifiedStoreSubscription> {
    const issuerId = this.required('payments.apple.issuerId');
    const keyId = this.required('payments.apple.keyId');
    const bundleId = this.required('payments.apple.bundleId');
    const privateKey = this.required('payments.apple.privateKey').replace(
      /\\n/g,
      '\n',
    );
    const environment =
      this.configService.get<string>('payments.apple.environment') ??
      'production';
    const host =
      environment === 'sandbox'
        ? 'https://api.storekit-sandbox.itunes.apple.com'
        : 'https://api.storekit.itunes.apple.com';
    const authorization = this.createAppleJwt({
      issuerId,
      keyId,
      bundleId,
      privateKey,
    });
    const response = await fetch(
      `${host}/inApps/v1/transactions/${encodeURIComponent(dto.transactionId)}`,
      { headers: { Authorization: `Bearer ${authorization}` } },
    );
    if (!response.ok) throw new Error(`apple_verification_${response.status}`);

    const body = (await response.json()) as { signedTransactionInfo?: string };
    const transaction = this.decodeJwtPayload<{
      bundleId?: string;
      environment?: string;
      expiresDate?: number;
      originalTransactionId?: string;
      productId?: string;
      revocationDate?: number;
      transactionId?: string;
      type?: string;
    }>(body.signedTransactionInfo ?? '');
    const expiresAt = new Date(transaction.expiresDate ?? 0);
    if (
      transaction.bundleId !== bundleId ||
      transaction.productId !== dto.productId ||
      transaction.transactionId !== dto.transactionId ||
      transaction.revocationDate ||
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt <= new Date()
    ) {
      throw new Error('apple_subscription_not_entitled');
    }

    return {
      productId: transaction.productId,
      transactionId: transaction.transactionId,
      originalTransactionId: transaction.originalTransactionId,
      expiresAt,
      autoRenew: true,
      environment: transaction.environment ?? environment,
      status: SubscriptionStatus.ACTIVE,
      providerPayload: { type: transaction.type },
    };
  }

  private required(key: string): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) throw new Error(`missing_${key}`);
    return value;
  }

  private parseServiceAccount(value: string): {
    client_email: string;
    private_key: string;
  } {
    const trimmed = value.trim();
    const credentialPath = isAbsolute(trimmed)
      ? trimmed
      : resolve(process.cwd(), trimmed);
    const json = trimmed.startsWith('{')
      ? trimmed
      : existsSync(credentialPath)
        ? readFileSync(credentialPath, 'utf8')
        : Buffer.from(trimmed, 'base64').toString('utf8');
    const account = JSON.parse(json) as {
      client_email?: string;
      private_key?: string;
    };
    if (!account.client_email || !account.private_key) {
      throw new Error('invalid_google_service_account');
    }
    return {
      client_email: account.client_email,
      private_key: account.private_key,
    };
  }

  private async getGoogleAccessToken(account: {
    client_email: string;
    private_key: string;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const assertion = this.signJwt(
      { alg: 'RS256', typ: 'JWT' },
      {
        iss: account.client_email,
        scope: 'https://www.googleapis.com/auth/androidpublisher',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      },
      account.private_key,
      'RSA-SHA256',
    );
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });
    if (!response.ok) throw new Error(`google_auth_${response.status}`);
    const body = (await response.json()) as { access_token?: string };
    if (!body.access_token) throw new Error('google_access_token_missing');
    return body.access_token;
  }

  private createAppleJwt(input: {
    issuerId: string;
    keyId: string;
    bundleId: string;
    privateKey: string;
  }): string {
    const now = Math.floor(Date.now() / 1000);
    return this.signJwt(
      { alg: 'ES256', kid: input.keyId, typ: 'JWT' },
      {
        iss: input.issuerId,
        iat: now,
        exp: now + 900,
        aud: 'appstoreconnect-v1',
        bid: input.bundleId,
      },
      input.privateKey,
      'sha256',
      true,
    );
  }

  private signJwt(
    header: Record<string, unknown>,
    payload: Record<string, unknown>,
    privateKey: string,
    algorithm: string,
    p1363 = false,
  ): string {
    const content = `${this.base64Url(JSON.stringify(header))}.${this.base64Url(JSON.stringify(payload))}`;
    const signer = createSign(algorithm);
    signer.update(content);
    signer.end();
    const signature = signer.sign(
      p1363 ? { key: privateKey, dsaEncoding: 'ieee-p1363' } : privateKey,
    );
    return `${content}.${signature.toString('base64url')}`;
  }

  private base64Url(value: string): string {
    return Buffer.from(value).toString('base64url');
  }

  private decodeJwtPayload<T>(token: string): T {
    const encoded = token.split('.')[1];
    if (!encoded) throw new Error('invalid_signed_transaction');
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as T;
  }
}
