export type RootEntryRoute = 'Auth' | 'Onboarding' | 'App';

// Mirrors the mobile-eligible surface the backend enforces at login (see
// mentora-api-server's common/rbac/role-catalog.ts: EXTERNAL_ROLE_CATALOG
// plus the dual-surface org roles admission_counselor and mentor). A token
// whose roles don't include any of these is stale (minted before this
// change) or belongs to a CRM-only staff account — either way it shouldn't
// be treated as a valid app session.
const MOBILE_ELIGIBLE_ROLES = [
  'user',
  'student',
  'parent',
  'teacher',
  'mentor',
  'guardian',
  'admission',
  'partner',
  'referral_partner',
  'franchise_partner',
  'vendor',
  'admission_counselor',
];

export const getRootEntryRoute = (
  accessToken: string | null,
  isOnboardingCompleted?: boolean,
  onboardingCompletionPending = false,
  roles?: string[]
): RootEntryRoute => {
  const isLoggedIn = Boolean(accessToken);
  const hasOnboarded = Boolean(isOnboardingCompleted);

  if (!isLoggedIn) {
    return 'Auth';
  }

  if (
    roles &&
    roles.length > 0 &&
    !roles.some((role) => MOBILE_ELIGIBLE_ROLES.includes(role))
  ) {
    return 'Auth';
  }

  if (onboardingCompletionPending || !hasOnboarded) {
    return 'Onboarding';
  }

  return 'App';
};
