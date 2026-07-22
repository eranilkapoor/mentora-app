import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { Role } from '@/common/enums';

interface RequestWithUser {
  user?: {
    permissions: Permission[];
    roles?: Role[];
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    //  No Permissions required
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Administrative break-glass roles are authoritative even when an older
    // token or pre-RBAC seed has no materialized permission list.
    if (
      request.user?.roles?.includes(Role.SUPER_ADMIN) ||
      request.user?.roles?.includes(Role.ADMIN)
    ) {
      return true;
    }
    const userPermissions = request.user?.permissions || [];

    //  O(1) lookup using Set
    const permissionSet = new Set(userPermissions);

    return requiredPermissions.every((perm) => permissionSet.has(perm));
  }
}
