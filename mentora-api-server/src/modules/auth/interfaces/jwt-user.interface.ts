import { Permission, PlanTier, Role } from '@/common/enums';

export interface JwtUser {
  sub: string;
  roles: Role[];
  permissions: Permission[];
  membership?: {
    tier: PlanTier;
  };
  iat?: number;
  exp?: number;
}
