import { MembershipTier } from '../common/membership';

export interface User {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;

  phone?: {
    countryCode: string;
    phone: string;
  };

  isEmailVerified?: boolean;
  isOnboardingCompleted: boolean;

  membership?: {
    tier: MembershipTier;
  };
}
