import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MEMBERSHIP_KEY } from '../decorators/membership.decorator';
import { ErrorCode } from '../constants';
import { throwForbidden } from '../exceptions/throw-app-exception';

interface MembershipRequest {
  user?: {
    membership?: {
      tier?: string;
    };
  };
}

export class MembershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredTier = this.reflector.getAllAndOverride<string>(
      MEMBERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTier) return true;

    const req = context.switchToHttp().getRequest<MembershipRequest>();
    const user = req.user;

    if (!user?.membership) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_REQUIRED);
    }

    if (user.membership?.tier !== requiredTier) {
      return throwForbidden(ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE, {
        reason: 'upgrade_required',
        requiredTier,
      });
    }

    return true;
  }
}
