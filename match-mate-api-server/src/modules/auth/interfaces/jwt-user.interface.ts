import { PlanTier } from 'src/common/enums';

export interface JwtUser {
  sub: string;
  roles: string[];
  permissions: string[];
  membership?: {
    tier: PlanTier;
  };
  iat?: number;
  exp?: number;
}
