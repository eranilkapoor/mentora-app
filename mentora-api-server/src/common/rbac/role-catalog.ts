import { DataScope, Role } from '@/common/enums';
import { EDUCATION_PLATFORM_USER_ROLES } from '@/common/constants/education-platform.constants';

// Single source of truth for "who is this role, which application surface(s)
// may they authenticate on, and what's their default record-level scope."
//
// The three user categories use disjoint role vocabularies (Role enum for
// platform + external users, EDUCATION_PLATFORM_USER_ROLES strings for
// organization membership), so category is resolved structurally by *which
// catalog a role is found in*, never guessed from the string itself.

export enum UserCategory {
  PLATFORM = 'platform',
  ORGANIZATION = 'organization',
  EXTERNAL = 'external',
}

export enum Surface {
  ADMIN_CRM = 'admin_crm',
  MOBILE_APP = 'mobile_app',
}

export interface RoleCatalogEntry {
  description: string;
  surfaces: readonly Surface[];
  dataScope: DataScope;
}

// Platform Users: global staff, not tied to any organization membership.
export const PLATFORM_ROLE_CATALOG: Readonly<
  Record<
    | Role.SUPER_ADMIN
    | Role.ADMIN
    | Role.SUPPORT
    | Role.FINANCE
    | Role.KYC_REVIEWER
    | Role.CONTENT_MODERATOR
    | Role.MARKETING_ADMIN
    | Role.CONTENT_MANAGER
    | Role.MODERATOR,
    RoleCatalogEntry
  >
> = {
  [Role.SUPER_ADMIN]: {
    description: 'Super Admin',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.ADMIN]: {
    description: 'Platform Admin',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.SUPPORT]: {
    description: 'Support Operator',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.FINANCE]: {
    description: 'Platform Finance Operator',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.KYC_REVIEWER]: {
    description: 'Student Safety Reviewer',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.CONTENT_MODERATOR]: {
    description: 'AI Tutor Content Moderator',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.MARKETING_ADMIN]: {
    description: 'Platform Marketing Admin',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.CONTENT_MANAGER]: {
    description: 'Academic Content Manager',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
  [Role.MODERATOR]: {
    description: 'Moderator',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.PLATFORM,
  },
};

// Same 9 values PLATFORM_ROLE_CATALOG is keyed by, exposed as an array for
// call sites that need a plain list (e.g. Mongo `$in` queries). Order is
// part of this module's public contract — tests assert it verbatim.
export const PLATFORM_ROLE_VALUES: readonly Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.SUPPORT,
  Role.FINANCE,
  Role.KYC_REVIEWER,
  Role.CONTENT_MODERATOR,
  Role.MARKETING_ADMIN,
  Role.CONTENT_MANAGER,
  Role.MODERATOR,
];

// Organization Users: staff scoped to one organization via UserMembership.
// Keyed by EDUCATION_PLATFORM_USER_ROLES strings, excluding 'super_admin'
// (a platform role that shouldn't have been in that list) and 'student'/
// 'parent' (external users, not org-chart staff).
export const ORG_ROLE_CATALOG: Readonly<Record<string, RoleCatalogEntry>> = {
  organization_admin: {
    description: 'Organization Admin',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.ORGANIZATION,
  },
  branch_admin: {
    description: 'Branch Admin',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.BRANCH,
  },
  admission_manager: {
    description: 'Admission Manager',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.DEPARTMENT,
  },
  admission_counselor: {
    description: 'Admission Counselor',
    surfaces: [Surface.ADMIN_CRM, Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  marketing_executive: {
    description: 'Marketing Executive',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.DEPARTMENT,
  },
  sales_executive: {
    description: 'Sales Executive',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.TEAM,
  },
  'call-center': {
    description: 'Call Center Agent',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.TEAM,
  },
  finance: {
    description: 'Organization Finance',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.BRANCH,
  },
  field_agent: {
    description: 'Field Agent',
    surfaces: [Surface.ADMIN_CRM],
    dataScope: DataScope.SELF,
  },
  mentor: {
    description: 'Mentor (dual-surface: CRM + mobile companion)',
    surfaces: [Surface.ADMIN_CRM, Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
};

// External & Learning Users: mobile app / public website only, never CRM.
export const EXTERNAL_ROLE_CATALOG: Readonly<
  Partial<Record<Role, RoleCatalogEntry>>
> = {
  [Role.USER]: {
    description: 'Base Account User',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.STUDENT]: {
    description: 'Student',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.PARENT]: {
    description: 'Parent / Guardian',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.TEACHER]: {
    description: 'Teacher',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  // Learning Mentor: a mobile-facing tutor role, distinct from the
  // dual-surface org-membership 'mentor' string in ORG_ROLE_CATALOG.
  [Role.MENTOR]: {
    description: 'Learning Mentor',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.GUARDIAN]: {
    description: 'Guardian',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.ADMISSION]: {
    description: 'Admission Applicant',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.PARTNER]: {
    description: 'Partner',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.REFERRAL_PARTNER]: {
    description: 'Referral Partner',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.FRANCHISE_PARTNER]: {
    description: 'Franchise Partner',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
  [Role.VENDOR]: {
    description: 'Vendor',
    surfaces: [Surface.MOBILE_APP],
    dataScope: DataScope.SELF,
  },
};

export function isPlatformRole(role: string): boolean {
  return Object.prototype.hasOwnProperty.call(PLATFORM_ROLE_CATALOG, role);
}

export function isExternalRole(role: string): boolean {
  return Object.prototype.hasOwnProperty.call(EXTERNAL_ROLE_CATALOG, role);
}

export function getOrgRoleEntry(role: string): RoleCatalogEntry | undefined {
  return ORG_ROLE_CATALOG[role];
}

export function getUserCategory(roles: readonly string[]): UserCategory | null {
  if (roles.some(isPlatformRole)) return UserCategory.PLATFORM;
  if (roles.some(isExternalRole)) return UserCategory.EXTERNAL;
  return null;
}

/**
 * Maps an organization-membership role string onto the global `Role` enum
 * stored on the `User` document. Every genuine org role becomes the inert
 * `Role.ORG_STAFF` bucket — real permissions for org staff live on
 * `user.permissions`, materialized via `resolveOrgRolePermissions()`
 * (org-role-permissions.ts), not derived from this enum value.
 *
 * Throws if `role` resolves to a platform role (e.g. 'super_admin', which
 * is nonsensically present in EDUCATION_PLATFORM_USER_ROLES) — a platform
 * user is never created through the organization-membership flow.
 */
export function resolveSystemRoleForOrgRole(role: string): Role {
  if (isPlatformRole(role)) {
    throw new Error(
      `"${role}" is a platform role and cannot be assigned as an organization membership role`,
    );
  }
  return Role.ORG_STAFF;
}

// Sanity check, enforced at module load: every entry in
// EDUCATION_PLATFORM_USER_ROLES other than the platform/external carve-outs
// must have a matching ORG_ROLE_CATALOG entry, so the catalog can't silently
// drift out of sync with the DTO-level allow-list.
const EXTERNAL_ORG_ROLE_STRINGS = new Set(['student', 'parent']);
for (const role of EDUCATION_PLATFORM_USER_ROLES) {
  if (isPlatformRole(role) || EXTERNAL_ORG_ROLE_STRINGS.has(role)) continue;
  if (!ORG_ROLE_CATALOG[role]) {
    throw new Error(
      `EDUCATION_PLATFORM_USER_ROLES contains "${role}" with no matching ORG_ROLE_CATALOG entry`,
    );
  }
}
