import { getRootEntryRoute } from './rootRoute.utils';

describe('RootNavigator entry route selection', () => {
  it('routes to Auth when no access token exists', () => {
    expect(getRootEntryRoute(null, false)).toBe('Auth');
    expect(getRootEntryRoute('', true)).toBe('Auth');
  });

  it('routes to Onboarding when logged in but onboarding is incomplete', () => {
    expect(getRootEntryRoute('token-1', false)).toBe('Onboarding');
    expect(getRootEntryRoute('token-1', undefined)).toBe('Onboarding');
  });

  it('keeps the user in Onboarding while completion success is pending', () => {
    expect(getRootEntryRoute('token-1', true, true)).toBe('Onboarding');
  });

  it('routes to App when logged in and onboarding is complete', () => {
    expect(getRootEntryRoute('token-1', true)).toBe('App');
  });

  it('routes to App for a mobile-eligible role', () => {
    expect(getRootEntryRoute('token-1', true, false, ['student'])).toBe('App');
  });

  it('routes to Auth when the token carries no mobile-eligible role', () => {
    expect(getRootEntryRoute('token-1', true, false, ['branch_admin'])).toBe(
      'Auth'
    );
  });

  it('does not gate on roles when none are provided yet', () => {
    expect(getRootEntryRoute('token-1', true, false, undefined)).toBe('App');
    expect(getRootEntryRoute('token-1', true, false, [])).toBe('App');
  });
});
