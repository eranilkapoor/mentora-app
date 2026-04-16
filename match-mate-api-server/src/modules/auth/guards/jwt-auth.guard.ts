import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

interface JwtErrorInfo {
  name?: string;
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
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

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest<TUser = Express.User>(
    err: Error | null,
    user: TUser | false,
    info: JwtErrorInfo,
  ): TUser {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expired');
    }

    if (err || !user) {
      console.error('Auth Error:', err || info);
      throw new UnauthorizedException(
        info?.message || 'Unauthorized access',
      );
    }

    return user;
  }
}
