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
  const secret = configService.get<string>('jwt.secret');

  if (!secret) {
    throw new Error('JWT_SECRET missing');
  }

  return {
    secret,
    accessExpiresIn: (configService.get<string>('jwt.accessExpiresIn') || '15m') as SignOptions['expiresIn'],
    refreshExpiresIn: (configService.get<string>('jwt.refreshExpiresIn') || '7d') as SignOptions['expiresIn'],
    audience: 'user',
    issuer: 'matchmate-api',
  };
};