import { ConfigService } from '@nestjs/config';
import { SignOptions } from 'jsonwebtoken';

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  accessExpiresIn: SignOptions['expiresIn'];
  refreshExpiresIn: SignOptions['expiresIn'];
  audience: string;
  refreshAudience: string;
  issuer: string;
}

export const getJwtConfig = (configService: ConfigService): JwtConfig => {
  const secret = configService.get<string>('jwt.secret');
  const refreshSecret =
    configService.get<string>('jwt.refreshSecret') ?? secret;

  if (!secret || !refreshSecret) {
    throw new Error('JWT_SECRET missing');
  }

  return {
    secret,
    refreshSecret,
    accessExpiresIn: configService.get<string>(
      'jwt.accessExpiresIn',
    ) as SignOptions['expiresIn'],
    refreshExpiresIn: configService.get<string>(
      'jwt.refreshExpiresIn',
    ) as SignOptions['expiresIn'],
    audience: configService.getOrThrow<string>('jwt.audience'),
    refreshAudience: configService.getOrThrow<string>('jwt.refreshAudience'),
    issuer: configService.getOrThrow<string>('jwt.issuer'),
  };
};

export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    audience: process.env.JWT_AUDIENCE || 'user',
    refreshAudience: process.env.JWT_REFRESH_AUDIENCE || 'user-refresh',
    issuer: process.env.JWT_ISSUER || 'mentora-api',
  },
});
