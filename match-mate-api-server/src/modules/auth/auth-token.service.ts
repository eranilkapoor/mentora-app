import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from 'src/config/jwt.config';
import { MembershipTier } from 'src/common/enums';

@Injectable()
export class AuthTokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    generatePayload(user: any) {
        const permissions = user.roles.flatMap((role: any) =>
            role.permissions.map((p: any) => p.name),
        );

        return {
            sub: user._id.toString(),
            roles: user.roles.map((r: any) => r.name),
            permissions: [...new Set(permissions)],
            membership: {
                tier: user.membership?.tier || MembershipTier.FREE,
            },
        };
    }

    generateTokens(payload: any) {
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