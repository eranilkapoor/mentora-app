import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../../../common/interfaces/app-request.interface';
import { JwtUser } from '../interfaces/jwt-user.interface';
import { ErrorCode } from 'src/common/constants';
import { throwUnauthorized } from 'src/common/exceptions/throw-app-exception';

export const CurrentUser = createParamDecorator(
  <K extends keyof JwtUser>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): JwtUser[K] | JwtUser => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    const user = request.user as JwtUser;

    if (!user) {
      return throwUnauthorized(ErrorCode.AUTH_USER_NOT_FOUND);
    }

    if (data && !(data in user)) {
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: 'requested_user_property_not_found',
        property: String(data),
      });
    }

    return data ? user[data] : user;
  },
);
