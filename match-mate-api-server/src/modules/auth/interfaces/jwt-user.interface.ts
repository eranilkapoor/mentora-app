import { MembershipTier } from "src/common/enums";

export interface JwtUser {
  sub: string;
  roles: string[];
  permissions: string[];
  membership?: {
    tier: MembershipTier;
  };
  iat?: number;
  exp?: number;
}
