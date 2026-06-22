import { createHmac, timingSafeEqual } from 'node:crypto';

export function createPaymentSignature(
  payload: string,
  secret: string,
): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyPaymentSignature(
  payload: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature || !/^[a-f\d]{64}$/i.test(signature)) return false;

  const expected = Buffer.from(createPaymentSignature(payload, secret), 'hex');
  const received = Buffer.from(signature, 'hex');
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
