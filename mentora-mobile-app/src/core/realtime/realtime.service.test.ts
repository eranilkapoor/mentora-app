import { isRealtimeAuthError } from './realtime-auth.utils';

describe('realtime authentication errors', () => {
  it.each([
    new Error('jwt expired'),
    new Error('Authentication failed'),
    'unauthorized socket',
    'invalid token',
  ])('detects authentication failure %p', (error) => {
    expect(isRealtimeAuthError(error)).toBe(true);
  });

  it('does not treat transport failures as authentication failures', () => {
    expect(isRealtimeAuthError(new Error('websocket timeout'))).toBe(false);
  });
});
