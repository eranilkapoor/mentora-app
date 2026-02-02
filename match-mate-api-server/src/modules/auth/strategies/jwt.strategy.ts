import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
//import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    //private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', '123456'),
    });
  }

  async validate(payload: any) {
    // Payload contains: { sub: userId, email: string, iat: number, exp: number }

    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isActive: true, // This should be fetched from the database
    }; //await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // This user object will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
