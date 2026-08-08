import { Permission } from '@/common/enums';
import { ORG_ROLE_CATALOG } from './role-catalog';

// Mirrors role-permissions.ts's prefix-matching pattern, but keyed by the
// EDUCATION_PLATFORM_USER_ROLES string rather than the global Role enum.
// Org staff always get Role.ORG_STAFF on their User document (which grants
// nothing on its own) — these permissions are what actually get materialized
// onto `user.permissions` at creation/role-change time.
const ORG_ROLE_PERMISSION_PREFIXES: Readonly<
  Record<string, readonly string[]>
> = {
  organization_admin: [
    'organization:',
    'lead:',
    'application:',
    'task:',
    'campaign:',
    'communication:',
    'module_record:',
    'report:',
    'document:',
    'workflow:',
    'program:',
    'dashboard:',
    'analytics:',
    'plan:view',
    'subscription:view',
    'payment:view',
  ],
  branch_admin: [
    'lead:',
    'application:',
    'task:',
    'campaign:',
    'communication:',
    'module_record:',
    'report:',
    'document:',
    'workflow:',
    'program:',
    'dashboard:view',
  ],
  admission_manager: [
    'application:',
    'document:',
    'task:',
    'lead:view',
    'report:view',
    'program:view',
  ],
  admission_counselor: [
    'lead:view',
    'lead:create',
    'lead:update',
    'lead:assign',
    'task:',
    'communication:',
    'application:view',
    'document:view',
  ],
  marketing_executive: [
    'campaign:',
    'communication:',
    'lead:view',
    'lead:export',
    'report:view',
    'analytics:view',
  ],
  sales_executive: ['lead:', 'task:', 'communication:view'],
  'call-center': ['lead:view', 'lead:update', 'communication:', 'task:view'],
  finance: ['payment:', 'subscription:view', 'report:view', 'analytics:view'],
  field_agent: ['lead:view', 'lead:update', 'task:view', 'communication:view'],
  mentor: ['student:view', 'schedule:view', 'task:view', 'communication:view'],
};

export function resolveOrgRolePermissions(role: string): Permission[] {
  if (!ORG_ROLE_CATALOG[role]) return [];
  const prefixes = ORG_ROLE_PERMISSION_PREFIXES[role] ?? [];
  return Object.values(Permission).filter((permission) =>
    prefixes.some((prefix) => permission.startsWith(prefix)),
  );
}
