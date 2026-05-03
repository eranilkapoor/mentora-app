export const MembershipTiers = {
  FREE: 'free',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

export type MembershipTier =
  (typeof MembershipTiers)[keyof typeof MembershipTiers];
