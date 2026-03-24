import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user.repository';

interface JwtPayload {
  userId: string;
  role: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private userRepo: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', '123456'),
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ userId: string; role: string }> {
    const user = await this.userRepo.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: payload.userId,
      role: payload.role,
    };
  }
}
