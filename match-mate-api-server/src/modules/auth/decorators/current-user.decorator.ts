import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRequest } from '../../../common/interfaces/app-request.interface';
import { JwtUser } from '../interfaces/jwt-user.interface';

export const CurrentUser = createParamDecorator(
  <K extends keyof JwtUser>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): JwtUser[K] | JwtUser => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    const user = request.user as JwtUser;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (data && !(data in user)) {
      throw new UnauthorizedException(
        `Property ${String(data)} not found in user`,
      );
    }

    return data ? user[data] : user;
  },
);
