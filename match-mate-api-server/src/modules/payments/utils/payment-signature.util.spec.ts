import {
  createPaymentSignature,
  verifyPaymentSignature,
} from './payment-signature.util';

describe('payment signature utilities', () => {
  const payload = 'order-id|payment-id';
  const secret = 'test-secret';

  it('accepts a valid HMAC signature', () => {
    const signature = createPaymentSignature(payload, secret);
    expect(verifyPaymentSignature(payload, signature, secret)).toBe(true);
  });

  it('rejects a signature generated for another payload', () => {
    const signature = createPaymentSignature('another-payload', secret);
    expect(verifyPaymentSignature(payload, signature, secret)).toBe(false);
  });

  it.each([undefined, '', 'not-hex', 'ab12'])(
    'rejects malformed signature %p',
    (signature) => {
      expect(verifyPaymentSignature(payload, signature, secret)).toBe(false);
    },
  );
});
