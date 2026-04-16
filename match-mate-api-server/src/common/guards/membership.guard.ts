import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MEMBERSHIP_KEY } from '../decorators/membership.decorator';

export class MembershipGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext) {
        const requiredTier = this.reflector.getAllAndOverride<string>(
            MEMBERSHIP_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredTier) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user?.membership) {
            throw new ForbiddenException('No membership');
        }

        if (user.membership?.tier !== requiredTier) {
            throw new ForbiddenException('Upgrade required');
        }

        return true;
    }
}