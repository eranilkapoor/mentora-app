import { generateKeyPairSync } from 'crypto';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { StoreReceiptVerifierService } from './store-receipt-verifier.service';

describe('StoreReceiptVerifierService', () => {
  const config = new Map<string, string>();
  const configService = {
    get: jest.fn((key: string) => config.get(key)),
  };
  let service: StoreReceiptVerifierService;

  const response = (body: unknown, ok = true, status = 200) =>
    ({
      ok,
      status,
      json: jest.fn().mockResolvedValue(body),
    }) as unknown as Response;

  beforeEach(() => {
    jest.restoreAllMocks();
    config.clear();
    configService.get.mockImplementation((key: string) => config.get(key));
    service = new StoreReceiptVerifierService(configService as never);
    global.fetch = jest.fn();
  });

  it('verifies an active Google Play subscription', async () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    config.set('payments.googlePlay.packageName', 'com.matchmate.app');
    config.set(
      'payments.googlePlay.serviceAccountJson',
      JSON.stringify({
        client_email: 'billing@project.iam.gserviceaccount.com',
        private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
      }),
    );
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response({ access_token: 'access-token' }))
      .mockResolvedValueOnce(
        response({
          subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
          acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
          latestOrderId: 'GPA.1',
          regionCode: 'IN',
          lineItems: [
            {
              productId: 'matchmate_gold',
              expiryTime: new Date(Date.now() + 86_400_000).toISOString(),
              offerDetails: { basePlanId: 'monthly' },
              autoRenewingPlan: { autoRenewEnabled: true },
            },
          ],
        }),
      );

    await expect(
      service.verify({
        gateway: PaymentGateway.GOOGLE_PLAY,
        planId: '507f1f77bcf86cd799439011',
        productId: 'matchmate_gold',
        basePlanId: 'monthly',
        transactionId: 'client-order',
        purchaseToken: 'purchase-token',
      }),
    ).resolves.toMatchObject({
      transactionId: 'GPA.1',
      productId: 'matchmate_gold',
      basePlanId: 'monthly',
      autoRenew: true,
    });
  });

  it('rejects a non-entitled Google Play subscription', async () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    config.set('payments.googlePlay.packageName', 'com.matchmate.app');
    config.set(
      'payments.googlePlay.serviceAccountJson',
      Buffer.from(
        JSON.stringify({
          client_email: 'billing@project.iam.gserviceaccount.com',
          private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
        }),
      ).toString('base64'),
    );
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response({ access_token: 'access-token' }))
      .mockResolvedValueOnce(
        response({ subscriptionState: 'SUBSCRIPTION_STATE_EXPIRED' }),
      );

    await expect(
      service.verify({
        gateway: PaymentGateway.GOOGLE_PLAY,
        planId: '507f1f77bcf86cd799439011',
        productId: 'matchmate_gold',
        basePlanId: 'monthly',
        transactionId: 'GPA.1',
        purchaseToken: 'purchase-token',
      }),
    ).rejects.toThrow('google_subscription_not_entitled');
  });

  it('verifies an Apple App Store transaction in sandbox', async () => {
    const { privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
    });
    config.set('payments.apple.issuerId', 'issuer');
    config.set('payments.apple.keyId', 'key');
    config.set('payments.apple.bundleId', 'com.matchmate.app');
    config.set(
      'payments.apple.privateKey',
      privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    );
    config.set('payments.apple.environment', 'sandbox');
    const transaction = {
      bundleId: 'com.matchmate.app',
      environment: 'Sandbox',
      expiresDate: Date.now() + 86_400_000,
      originalTransactionId: 'original-1',
      productId: 'matchmate_gold_monthly',
      transactionId: 'transaction-1',
      type: 'Auto-Renewable Subscription',
    };
    const signedTransactionInfo = `header.${Buffer.from(
      JSON.stringify(transaction),
    ).toString('base64url')}.signature`;
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      response({ signedTransactionInfo }),
    );

    await expect(
      service.verify({
        gateway: PaymentGateway.APPLE_IAP,
        planId: '507f1f77bcf86cd799439011',
        productId: transaction.productId,
        transactionId: transaction.transactionId,
        receiptData: 'storekit-jws',
      }),
    ).resolves.toMatchObject({
      productId: transaction.productId,
      originalTransactionId: 'original-1',
      environment: 'Sandbox',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.storekit-sandbox.itunes.apple.com'),
      expect.any(Object),
    );
  });

  it('fails closed when store credentials or provider responses are invalid', async () => {
    await expect(
      service.verify({
        gateway: PaymentGateway.GOOGLE_PLAY,
        planId: '507f1f77bcf86cd799439011',
        productId: 'matchmate_gold',
        transactionId: 'GPA.1',
        purchaseToken: 'token',
      }),
    ).rejects.toThrow('missing_payments.googlePlay.packageName');

    config.set('payments.apple.issuerId', 'issuer');
    config.set('payments.apple.keyId', 'key');
    config.set('payments.apple.bundleId', 'com.matchmate.app');
    config.set('payments.apple.privateKey', 'invalid-key');
    await expect(
      service.verify({
        gateway: PaymentGateway.APPLE_IAP,
        planId: '507f1f77bcf86cd799439011',
        productId: 'matchmate_gold_monthly',
        transactionId: 'transaction-1',
        receiptData: 'jws',
      }),
    ).rejects.toThrow();
  });
});
