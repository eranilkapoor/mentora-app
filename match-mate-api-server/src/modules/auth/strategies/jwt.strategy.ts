import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user.repository';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepo: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', '123456'),
    });
  }

  async validate(payload: any) {
    const user = {
      userId: payload.userId,
      role: payload.role,
    }; 
    
    await this.userRepo.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.userId,
      role: user.role,
    };
  }
}
