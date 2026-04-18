import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ROLES_KEY } from '../decorators/admin.decorator';
import { AdminRole } from '../enums/admin-role.enum';

interface AdminRequest {
  user?: {
    role?: AdminRole;
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<AdminRequest>();
    const admin = request.user; // injected by AuthGuard (JWT)

    if (!admin?.role || !roles.includes(admin.role)) {
      throw new ForbiddenException('Admin access denied');
    }

    return true;
  }
}
