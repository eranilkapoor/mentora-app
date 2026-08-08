export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUPPORT = 'support',
  FINANCE = 'finance',
  KYC_REVIEWER = 'kyc_reviewer',
  CONTENT_MODERATOR = 'content_moderator',
  MARKETING_ADMIN = 'marketing_admin',
  USER = 'user',
  STUDENT = 'student',
  PARENT = 'parent',
  MENTOR = 'mentor',
  TEACHER = 'teacher',
  CONTENT_MANAGER = 'content_manager',
  MODERATOR = 'moderator',
  // Organization-membership staff whose real permissions come from their
  // UserMembership role (see common/rbac/org-role-permissions.ts), not from
  // this enum. Replaces the old silent fallback to Role.ADMIN for any org
  // role that wasn't one of a handful of special-cased strings.
  ORG_STAFF = 'org_staff',
  // External / learning users (mobile app + public website only).
  GUARDIAN = 'guardian',
  ADMISSION = 'admission',
  PARTNER = 'partner',
  REFERRAL_PARTNER = 'referral_partner',
  FRANCHISE_PARTNER = 'franchise_partner',
  VENDOR = 'vendor',
}
