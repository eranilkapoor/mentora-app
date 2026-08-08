// Mirrors the mobile-eligible role check enforced server-side at login
// (see mentora-api-server's common/rbac/role-catalog.ts EXTERNAL_ROLE_CATALOG
// and ORG_ROLE_CATALOG dual-surface entries). Kept minimal here since the two
// apps don't share a package — this only covers what the app's UI branches on.
export function isParentRole(roles: string[] | undefined): boolean {
  return Boolean(roles?.includes('parent'));
}
