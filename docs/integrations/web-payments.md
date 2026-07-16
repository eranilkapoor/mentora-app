# Web Payments: Razorpay, Stripe, Manual

## Current Implementation Status

The payment domain supports these gateway values:

- `razorpay`
- `stripe`
- `apple_iap`
- `google_play`
- `manual`

For non-store payments, the current backend:

- Creates an internal order through `POST /api/v1/payments/order`.
- Stores gateway selection on the payment record.
- Verifies payment through `POST /api/v1/payments/verify` using an app-level signature.
- Processes provider-style webhooks through `POST /api/v1/payments/webhook`.
- Supports coupons, invoices, refunds/admin flows, reconciliation, and settlement reports.

Important: there is no Razorpay SDK order creation or Stripe PaymentIntent creation in the current code. Before enabling live Razorpay/Stripe checkout, add provider-specific order/payment-intent creation and provider-native signature verification.

## Backend Environment

```env
PAYMENT_GST_PERCENTAGE=18
PAYMENT_SIGNATURE_SECRET=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_ALLOW_UNSIGNED_VERIFICATION=false
```

Production requires:

```env
PAYMENT_SIGNATURE_SECRET=<strong random secret>
PAYMENT_WEBHOOK_SECRET=<strong random secret>
PAYMENT_ALLOW_UNSIGNED_VERIFICATION=false
```

## Existing API Flow

Create order:

```http
POST /api/v1/payments/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "<plan-id>",
  "currency": "INR",
  "gateway": "razorpay",
  "purpose": "subscription",
  "idempotencyKey": "<client-generated-key>"
}
```

Verify:

```http
POST /api/v1/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "<internal-order-id>",
  "gatewayPaymentId": "<provider-payment-id>",
  "gatewayOrderId": "<provider-order-id>",
  "signature": "<signature>"
}
```

Webhook:

```http
POST /api/v1/payments/webhook
X-Payment-Signature: <signature>
Content-Type: application/json
```

The webhook signature is calculated over:

```text
eventId|orderId|status
```

using `PAYMENT_WEBHOOK_SECRET`.

## Razorpay Production Wiring Still Needed

Add:

1. `RAZORPAY_KEY_ID`
2. `RAZORPAY_KEY_SECRET`
3. Razorpay order creation in `PaymentsService.createOrder`.
4. Return Razorpay `order_id` to the mobile/web client.
5. Verify Razorpay checkout signature:

```text
hmac_sha256(order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
```

6. Configure Razorpay webhook secret and verify Razorpay webhook body signatures.
7. Map Razorpay payment/refund events to existing payment statuses.

## Stripe Production Wiring Still Needed

Add:

1. `STRIPE_SECRET_KEY`
2. `STRIPE_WEBHOOK_SECRET`
3. Stripe PaymentIntent or Checkout Session creation.
4. Return `client_secret` or checkout URL.
5. Verify Stripe webhooks with raw request body.
6. Map `payment_intent.succeeded`, `payment_intent.payment_failed`, and refund events to existing payment statuses.

## Validation Steps

Existing backend:

```bash
cd match-mate-api-server
npm run env:validate
npm run test -- payments.service.spec.ts
npm run test -- payment-signature.util.spec.ts
```

Before production Razorpay/Stripe launch:

1. Confirm provider SDK order creation is implemented.
2. Confirm real provider signature verification is implemented.
3. Confirm webhook endpoint validates raw provider payload signature.
4. Run one successful payment, one failed payment, one refund, one replayed webhook.
5. Confirm subscription activates only once.
6. Confirm invoice is generated.

## Common Failures

| Symptom                                    | Check                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Payment verifies without provider checkout | Current implementation is internal-signature based; provider SDK handoff is still needed |
| Duplicate subscription activation          | Use idempotency key and replay webhook tests                                             |
| Production env validation fails            | `PAYMENT_SIGNATURE_SECRET` and `PAYMENT_WEBHOOK_SECRET` are required                     |
| Wrong tax/total                            | Check `PAYMENT_GST_PERCENTAGE` and plan currency/price                                   |
