import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
//import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { REDIS } from 'src/infrastructure/databases/redis/redis.provider';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    //@InjectRedis() private readonly redis: Redis,
    @Inject(REDIS) private readonly redis: Redis,

  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get rate limit config from decorator
    const rateLimitConfig = this.reflector.get(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitConfig) {
      return true; // No rate limit defined
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Create unique key per user/IP
    const identifier = this.getIdentifier(request);
    const key = `rate-limit:${rateLimitConfig.name}:${identifier}`;

    // Get current count from Redis
    const currentCount = await this.redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    // Get limit based on user membership
    const limit = this.getLimit(request, rateLimitConfig);

    // Calculate reset time
    const ttl = rateLimitConfig.ttl;
    const resetAt = Date.now() + ttl * 1000;

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count - 1));
    response.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000));

    // Check if limit exceeded
    if (count >= limit) {
      const retryAfter = await this.redis.ttl(key);
      response.setHeader('Retry-After', retryAfter);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: rateLimitConfig.message,
          retryAfter,
          resetAt,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    if (count === 0) {
      // First request - set with expiry
      await this.redis.setex(key, ttl, 1);
    } else {
      // Increment existing
      await this.redis.incr(key);
    }

    return true;
  }

  private getIdentifier(request: any): string {
    // Use user ID if authenticated, otherwise use IP
    const userId = request.user?.id;
    const ip = request.ip || request.connection.remoteAddress;
    return userId || ip;
  }

  private getLimit(request: any, config: any): number {
    // Check if user is premium
    const isPremium = request.user?.membership?.tier !== 'free';
    return isPremium && config.limitPremium 
      ? config.limitPremium 
      : config.limit;
  }
}