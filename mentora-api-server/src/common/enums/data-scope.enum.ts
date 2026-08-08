// The record-level access axis, orthogonal to RBAC (which permits actions).
// A user's DataScope determines which records their permitted actions may
// reach, from narrowest to widest.
export enum DataScope {
  SELF = 'self',
  TEAM = 'team',
  DEPARTMENT = 'department',
  BRANCH = 'branch',
  ORGANIZATION = 'organization',
  PLATFORM = 'platform',
}
