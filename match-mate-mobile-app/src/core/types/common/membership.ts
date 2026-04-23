export const MembershipTiers = {
  FREE: 'free',
  GOLD: 'gold',
  PREMIUM: 'premium',
} as const;

export type MembershipTier =
  (typeof MembershipTiers)[keyof typeof MembershipTiers];
