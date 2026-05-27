import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Permission } from '@/common/enums/permission.enum';
import { getJwtConfig } from '@/config/jwt.config';

interface JwtPayload {
  sub: string;
  roles: string[];
  permissions: Permission[];
  membership?: {
    tier: string;
  };
}

interface RefreshRequest {
  body?: {
    refreshToken?: string;
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const jwtConfig = getJwtConfig(configService);

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      passReqToCallback: true,
      secretOrKey: jwtConfig.secret,
    });
  }

  validate(req: RefreshRequest, payload: JwtPayload) {
    return {
      sub: payload.sub,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      membership: payload.membership,
      refreshToken: req.body?.refreshToken,
    };
  }
}
