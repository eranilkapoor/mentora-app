import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiResponseMessage,
  isPlanAccessError,
} from './apiMessage';

const t = ((key: string) =>
  key === 'api.codes.auth_invalid_credentials'
    ? 'Invalid credentials'
    : key === 'fallback'
      ? 'Fallback message'
      : key) as never;

describe('apiMessage', () => {
  it('extracts API error codes from direct and RTK-query shaped errors', () => {
    expect(getApiErrorCode({ code: 'SUBSCRIPTION.REQUIRED' })).toBe(
      'SUBSCRIPTION.REQUIRED'
    );
    expect(getApiErrorCode({ data: { code: 'CHAT.ACCESS_DENIED' } })).toBe(
      'CHAT.ACCESS_DENIED'
    );
    expect(getApiErrorCode(new Error('boom'))).toBeUndefined();
  });

  it('detects plan access errors', () => {
    expect(isPlanAccessError({ code: 'SUBSCRIPTION.REQUIRED' })).toBe(true);
    expect(
      isPlanAccessError({
        data: { code: 'SUBSCRIPTION.FEATURE_NOT_AVAILABLE' },
      })
    ).toBe(true);
    expect(isPlanAccessError({ code: 'AUTH.INVALID_CREDENTIALS' })).toBe(false);
  });

  it('prefers translated response messages then API messages', () => {
    expect(
      getApiResponseMessage(t, {
        success: false,
        code: 'AUTH.INVALID_CREDENTIALS',
        message: 'Server message',
      })
    ).toBe('Invalid credentials');

    expect(
      getApiResponseMessage(
        t,
        {
          success: false,
          code: 'UNKNOWN.CODE',
          message: ['One', 'Two'],
        } as never,
        'fallback'
      )
    ).toBe('One\nTwo');
  });

  it('normalizes API, Error, and unknown failures', () => {
    expect(
      getApiErrorMessage(t, {
        data: { code: 'AUTH.INVALID_CREDENTIALS', message: 'Nope' },
      })
    ).toBe('Invalid credentials');
    expect(getApiErrorMessage(t, new Error('Network failed'))).toBe(
      'Network failed'
    );
    expect(getApiErrorMessage(t, 'bad', 'fallback')).toBe('Fallback message');
  });
});
