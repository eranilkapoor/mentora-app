import { ConfigService } from "@nestjs/config";
import { SignOptions } from 'jsonwebtoken';

export interface JwtConfig {
  secret: string;
  accessExpiresIn: SignOptions['expiresIn'];
  refreshExpiresIn: SignOptions['expiresIn'];
  audience: string;
  issuer: string;
}

export const getJwtConfig = (configService: ConfigService): JwtConfig => {
  const secret = configService.getOrThrow<string>('jwt.secret');

  if (!secret) {
    throw new Error('JWT_SECRET missing');
  }

  return {
    secret,
    accessExpiresIn: (configService.getOrThrow<string>('jwt.accessExpiresIn') || '15m') as SignOptions['expiresIn'],
    refreshExpiresIn: (configService.getOrThrow<string>('jwt.refreshExpiresIn') || '7d') as SignOptions['expiresIn'],
    audience: 'user',
    issuer: 'matchmate-api',
  };
};

export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});