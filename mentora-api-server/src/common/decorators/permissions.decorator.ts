import { SetMetadata } from '@nestjs/common';
import { Permission } from '@/common/enums';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions Decorator
 * Usage:
 * @Permissions('view_users', 'block_users')
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
