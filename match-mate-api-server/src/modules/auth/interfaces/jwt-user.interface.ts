import { Permission, PlanTier, Role } from 'src/common/enums';

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
