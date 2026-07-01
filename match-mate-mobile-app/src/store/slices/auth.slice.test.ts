import reducer, {
  logout,
  setAccessToken,
  setCredentials,
  setProfileCompleted,
  setUser,
} from './auth.slice';
import type { User } from '@/core/types';

const createUser = (overrides: Partial<User> = {}): User => ({
  userId: 'user-1',
  isOnboardingCompleted: false,
  ...overrides,
});

describe('auth.slice workflow state transitions', () => {
  it('bootstraps auth state by setting access token and then user profile', () => {
    const bootstrappedTokenState = reducer(
      undefined,
      setAccessToken('access-token-1')
    );

    const hydratedProfileState = reducer(
      bootstrappedTokenState,
      setUser(createUser({ firstName: 'Ari' }))
    );

    expect(bootstrappedTokenState).toMatchObject({
      accessToken: 'access-token-1',
      user: null,
    });
    expect(hydratedProfileState).toMatchObject({
      accessToken: 'access-token-1',
      user: {
        userId: 'user-1',
        firstName: 'Ari',
        isOnboardingCompleted: false,
      },
    });
  });

  it('stores full credentials in a single step for login/refresh success', () => {
    const state = reducer(
      undefined,
      setCredentials({
        accessToken: 'access-token-2',
        user: createUser({ isOnboardingCompleted: true }),
      })
    );

    expect(state).toMatchObject({
      accessToken: 'access-token-2',
      user: {
        userId: 'user-1',
        isOnboardingCompleted: true,
      },
    });
  });

  it('updates onboarding completion flag only when a user exists', () => {
    const withUser = reducer(
      undefined,
      setCredentials({
        accessToken: 'access-token-3',
        user: createUser({ isOnboardingCompleted: false }),
      })
    );

    const completed = reducer(withUser, setProfileCompleted(true));
    const withoutUser = reducer(undefined, setProfileCompleted(true));

    expect(completed.user?.isOnboardingCompleted).toBe(true);
    expect(withoutUser.user).toBeNull();
  });

  it('clears auth state on logout', () => {
    const loggedIn = reducer(
      undefined,
      setCredentials({
        accessToken: 'access-token-4',
        user: createUser({ firstName: 'Rin', isOnboardingCompleted: true }),
      })
    );

    const loggedOut = reducer(loggedIn, logout());

    expect(loggedOut).toEqual({
      accessToken: null,
      user: null,
    });
  });
});
