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
    permissionPrefixes: [
      'user:',
      'student:',
      'parent:',
      'schedule:',
      'report:',
      'block:',
      'activity:',
      'crm_lead:',
      'crm_task:',
      'crm_communication:',
      'crm_module_record:view',
    ],
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
      'crm_report:',
      'crm_module_record:view',
    ],
  },
  {
    name: Role.KYC_REVIEWER,
    description: 'Student Safety Reviewer',
    permissionPrefixes: [
      'profile:',
      'student:',
      'parent:',
      'media:',
      'activity:',
    ],
  },
  {
    name: Role.CONTENT_MODERATOR,
    description: 'AI Tutor Content Moderator',
    permissionPrefixes: ['media:', 'chat:', 'ai_tutor:', 'report:', 'block:'],
  },
  {
    name: Role.MARKETING_ADMIN,
    description: 'Marketing Admin',
    permissionPrefixes: [
      'notification:',
      'analytics:',
      'dashboard:',
      'crm_lead:view',
      'crm_lead:export',
      'crm_campaign:',
      'crm_communication:',
      'crm_report:',
      'crm_module_record:',
    ],
  },
  {
    name: Role.MODERATOR,
    description: 'Moderator',
    permissionPrefixes: [
      'user:',
      'profile:',
      'student:',
      'parent:',
      'media:',
      'report:',
      'block:',
      'chat:',
      'ai_tutor:',
    ],
  },
  {
    name: Role.STUDENT,
    description: 'Student',
    permissionPrefixes: [
      'student:view',
      'student:update',
      'academic_record:view',
      'subject:view',
      'schedule:view',
      'schedule:manage',
      'ai_tutor:view',
      'ai_tutor:use',
      'learning_entitlement:view',
      'parental_control:view',
    ],
  },
  {
    name: Role.PARENT,
    description: 'Parent or Guardian',
    permissionPrefixes: [
      'parent:',
      'student:',
      'academic_record:',
      'subject:view',
      'schedule:',
      'ai_tutor:view',
      'learning_entitlement:view',
      'parental_control:',
      'payment:',
      'subscription:',
    ],
  },
  {
    name: Role.MENTOR,
    description: 'Learning Mentor',
    permissionPrefixes: [
      'student:view',
      'academic_record:view',
      'subject:view',
      'schedule:view',
      'ai_tutor:view',
    ],
  },
  {
    name: Role.TEACHER,
    description: 'Teacher',
    permissionPrefixes: [
      'student:view',
      'academic_record:view',
      'academic_record:manage',
      'subject:view',
      'schedule:view',
      'ai_tutor:view',
    ],
  },
  {
    name: Role.CONTENT_MANAGER,
    description: 'Academic Content Manager',
    permissionPrefixes: ['subject:', 'ai_tutor:view', 'ai_tutor:moderate'],
  },
  { name: Role.USER, description: 'Base Account User', permissionPrefixes: [] },
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

export function permissionsForBuiltInRoles(
  roles: readonly string[],
): Permission[] {
  const roleSet = new Set(roles);
  return [
    ...new Set(
      ROLE_PERMISSION_POLICIES.filter((policy) =>
        roleSet.has(policy.name),
      ).flatMap((policy) => resolveRolePermissions(policy)),
    ),
  ];
}
