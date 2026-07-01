export type RootEntryRoute = 'Auth' | 'Onboarding' | 'App';

export const getRootEntryRoute = (
  accessToken: string | null,
  isOnboardingCompleted?: boolean
): RootEntryRoute => {
  const isLoggedIn = Boolean(accessToken);
  const hasOnboarded = Boolean(isOnboardingCompleted);

  if (!isLoggedIn) {
    return 'Auth';
  }

  if (!hasOnboarded) {
    return 'Onboarding';
  }

  return 'App';
};
