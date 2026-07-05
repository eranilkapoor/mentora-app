import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from '@/config/jwt.config';
import { PlanTier } from '@/common/enums';
import { permissionsForBuiltInRoles } from '@/common/rbac/role-permissions';

interface TokenPermission {
  name: string;
}

interface TokenRole {
  name: string;
  permissions: TokenPermission[];
}

interface TokenUser {
  _id: { toString(): string };
  roles: Array<TokenRole | string>;
  permissions?: string[];
  membership?: {
    tier?: PlanTier;
  };
}

interface TokenPayload {
  sub: string;
  roles: string[];
  permissions: string[];
  membership: {
    tier: PlanTier;
  };
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generatePayload(user: TokenUser): TokenPayload {
    const roleNames = user.roles.map((role) =>
      typeof role === 'string' ? role : role.name,
    );

    const rolePermissions = user.roles.flatMap((role) =>
      typeof role === 'string'
        ? []
        : role.permissions.map((permission) => permission.name),
    );

    const permissions = [
      ...new Set([
        ...(user.permissions ?? []),
        ...rolePermissions,
        ...permissionsForBuiltInRoles(roleNames),
      ]),
    ];

    return {
      sub: user._id.toString(),
      roles: roleNames,
      permissions,
      membership: {
        tier: user.membership?.tier || PlanTier.FREE,
      },
    };
  }

  generateTokens(payload: TokenPayload) {
    const jwtConfig = getJwtConfig(this.configService);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiresIn,
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.refreshExpiresIn,
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });

    return { accessToken, refreshToken };
  }
}
