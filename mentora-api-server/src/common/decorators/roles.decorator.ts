import { SetMetadata } from '@nestjs/common';
import { Role } from '@/common/enums';

export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * Usage:
 * @Roles('admin', 'user')
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
