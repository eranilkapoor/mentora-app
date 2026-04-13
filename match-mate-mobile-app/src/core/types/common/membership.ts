export const MembershipTiers = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export type MembershipTier =
  (typeof MembershipTiers)[keyof typeof MembershipTiers];
