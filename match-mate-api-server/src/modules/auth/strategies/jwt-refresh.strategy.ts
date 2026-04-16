import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');

    if (!secret) throw new Error('JWT_SECRET missing');

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    return {
      userId: payload.sub,
      refreshToken: req.body.refreshToken,
    };
  }
}