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

  // Platform Role enum values (see mentora-api-server's common/enums/role.enum.ts).
  // Not re-exported as a shared type since the two apps don't share a package;
  // treated as an open string union here so new backend roles don't break typing.
  roles?: string[];

  membership?: {
    tier: MembershipTier;
  };
}
