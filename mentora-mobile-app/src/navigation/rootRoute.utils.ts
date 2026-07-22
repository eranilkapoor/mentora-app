export type RootEntryRoute = 'Auth' | 'Onboarding' | 'App';

export const getRootEntryRoute = (
  accessToken: string | null,
  isOnboardingCompleted?: boolean,
  onboardingCompletionPending = false
): RootEntryRoute => {
  const isLoggedIn = Boolean(accessToken);
  const hasOnboarded = Boolean(isOnboardingCompleted);

  if (!isLoggedIn) {
    return 'Auth';
  }

  if (onboardingCompletionPending || !hasOnboarded) {
    return 'Onboarding';
  }

  return 'App';
};
