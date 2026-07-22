import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PlanTier, Status } from '@/common/enums';
import { permissionsForBuiltInRoles } from '@/common/rbac/role-permissions';
import { getJwtConfig } from '@/config/jwt.config';
import { User, UserDocument } from '../schemas/user.schema';
import {
  UserSession,
  UserSessionDocument,
} from '../schemas/user-session.schema';

interface JwtPayload {
  sub: string;
  roles?: string[];
  permissions?: Permission[];
  membership?: { tier: string };
  type?: string;
  sid?: string;
  family?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserSession.name)
    private readonly sessionModel: Model<UserSessionDocument>,
  ) {
    const jwtConfig = getJwtConfig(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });
  }

  async validate(payload: JwtPayload) {
    if (
      payload.type !== 'access' ||
      !Types.ObjectId.isValid(payload.sub) ||
      !payload.sid ||
      !Types.ObjectId.isValid(payload.sid) ||
      !payload.family
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    const [user, session] = await Promise.all([
      this.userModel
        .findOne({
          _id: new Types.ObjectId(payload.sub),
          status: {
            $nin: [Status.BLOCKED, Status.SUSPENDED, Status.DELETED],
          },
        })
        .select('roles permissions membership status')
        .lean()
        .exec(),
      this.sessionModel
        .findOne({
          _id: new Types.ObjectId(payload.sid),
          userId: new Types.ObjectId(payload.sub),
          tokenFamilyId: payload.family,
          isActive: true,
          expiresAt: { $gt: new Date() },
        })
        .select('_id')
        .lean()
        .exec(),
    ]);

    if (!user || !session) {
      throw new UnauthorizedException('Session is no longer active');
    }

    const roles = user.roles ?? [];
    const permissions = [
      ...new Set([
        ...(user.permissions ?? []),
        ...permissionsForBuiltInRoles(roles),
      ]),
    ];

    return {
      sub: payload.sub,
      roles,
      permissions,
      membership: {
        tier: user.membership?.tier ?? PlanTier.FREE,
      },
    };
  }
}
