import { Permission, Role } from '@/common/enums';

export interface RolePermissionPolicy {
  name: Role;
  description: string;
  allPermissions?: boolean;
  permissionPrefixes: readonly string[];
}

export const ROLE_PERMISSION_POLICIES: readonly RolePermissionPolicy[] = [
  {
    name: Role.SUPER_ADMIN,
    description: 'Super Admin',
    allPermissions: true,
    permissionPrefixes: [],
  },
  {
    name: Role.ADMIN,
    description: 'Admin',
    allPermissions: true,
    permissionPrefixes: [],
  },
  {
    name: Role.SUPPORT,
    description: 'Support Operator',
    permissionPrefixes: ['user:', 'report:', 'block:', 'activity:'],
  },
  {
    name: Role.FINANCE,
    description: 'Finance Operator',
    permissionPrefixes: [
      'payment:',
      'subscription:',
      'plan:',
      'analytics:',
      'dashboard:',
    ],
  },
  {
    name: Role.KYC_REVIEWER,
    description: 'KYC Reviewer',
    permissionPrefixes: ['profile:', 'media:', 'activity:'],
  },
  {
    name: Role.CONTENT_MODERATOR,
    description: 'Content Moderator',
    permissionPrefixes: ['media:', 'chat:', 'report:', 'block:'],
  },
  {
    name: Role.MARKETING_ADMIN,
    description: 'Marketing Admin',
    permissionPrefixes: ['notification:', 'analytics:', 'dashboard:'],
  },
  {
    name: Role.MODERATOR,
    description: 'Moderator',
    permissionPrefixes: [
      'user:',
      'profile:',
      'media:',
      'report:',
      'block:',
      'chat:',
    ],
  },
  {
    name: Role.USER,
    description: 'Regular User',
    permissionPrefixes: [],
  },
];

export function resolveRolePermissions(
  policy: RolePermissionPolicy,
  permissions: readonly Permission[] = Object.values(Permission),
): Permission[] {
  if (policy.allPermissions) return [...permissions];

  return permissions.filter((permission) =>
    policy.permissionPrefixes.some((prefix) => permission.startsWith(prefix)),
  );
}
