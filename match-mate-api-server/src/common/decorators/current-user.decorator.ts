import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../interfaces/app-request.interface';
import { JwtUser } from '../../modules/auth/interfaces/jwt-user.interface';

export const CurrentUser = createParamDecorator(
  <K extends keyof JwtUser>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): JwtUser[K] | JwtUser | undefined => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();

    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
