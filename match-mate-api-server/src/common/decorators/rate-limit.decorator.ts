import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate-limit';

export interface RateLimitConfig {
  name: string;
  ttl: number; // seconds
  limit: number;
  limitPremium?: number;
  message: string;
}

export const RateLimit = (options: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, options);

// Usage in controller:
/*
@RateLimit({
  name: 'login',
  ttl: 900,
  limit: 5,
  message: 'Too many login attempts',
})
@Post('login')
async login() { ... }
*/
