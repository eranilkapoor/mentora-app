import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { INTERNAL_API_KEY_REQUIRED } from '@/common/decorators/internal-api-key.decorator';
import { AppLogger } from '@/common/logger/logger.service';
import { ErrorCode } from '@/common/constants';
import { throwUnauthorized } from '@/common/exceptions/throw-app-exception';

interface JwtErrorInfo {
  name?: string;
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: AppLogger,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiresInternalApiKey = this.reflector.getAllAndOverride<boolean>(
      INTERNAL_API_KEY_REQUIRED,
      [context.getHandler(), context.getClass()],
    );

    if (requiresInternalApiKey) {
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest<TUser = Express.User>(
    err: Error | null,
    user: TUser | false,
    info: JwtErrorInfo,
  ): TUser {
    if (info?.name === 'TokenExpiredError') {
      return throwUnauthorized(ErrorCode.AUTH_TOKEN_EXPIRED);
    }

    if (err || !user) {
      this.logger.error('Auth Error:', err?.stack);
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: info?.message ?? 'unauthorized_access',
      });
    }

    return user;
  }
}
