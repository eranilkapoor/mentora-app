import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Permission } from 'src/common/enums/permission.enum';
import { getJwtConfig } from 'src/config/jwt.config';

interface JwtPayload {
  sub: string;
  roles: string[];
  permissions: Permission[];
  membership?: {
    tier: string;
  };
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtConfig = getJwtConfig(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      membership: payload.membership,
    };
  }
}
