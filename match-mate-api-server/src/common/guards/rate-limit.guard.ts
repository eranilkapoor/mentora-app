import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import {
  RATE_LIMIT_KEY,
  RateLimitConfig,
} from '../decorators/rate-limit.decorator';
import { REDIS } from 'src/infrastructure/databases/redis/redis.provider';

interface AuthenticatedUser {
  id?: string;
  membership?: {
    tier: string;
  };
}

interface AuthenticatedRequest extends Omit<Request, 'connection'> {
  user?: AuthenticatedUser;
  connection: {
    remoteAddress?: string;
  };
}

interface RateLimitErrorResponse {
  statusCode: number;
  message: string;
  retryAfter: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitConfig = this.reflector.get<RateLimitConfig>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    const identifier = this.getIdentifier(request);
    const key = `rate-limit:${rateLimitConfig.name}:${identifier}`;

    const [currentCount, existingTtl] = await Promise.all([
      this.redis.get(key),
      this.redis.ttl(key),
    ]);

    const count = currentCount !== null ? parseInt(currentCount, 10) : 0;
    const limit = this.getLimit(request, rateLimitConfig);
    const { ttl } = rateLimitConfig;
    const resetAt = Date.now() + (existingTtl > 0 ? existingTtl : ttl) * 1000;

    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count - 1));
    response.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000));

    if (count >= limit) {
      response.setHeader('Retry-After', existingTtl);

      this.logger.warn(
        `Rate limit exceeded for identifier: ${identifier}, key: ${key}`,
      );

      const errorResponse: RateLimitErrorResponse = {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: rateLimitConfig.message,
        retryAfter: existingTtl,
        resetAt,
      };

      throw new HttpException(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.incrementCounter(key, count, ttl);

    return true;
  }

  private getIdentifier(request: AuthenticatedRequest): string {
    const userId = request.user?.id;
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
      request.ip ??
      request.connection.remoteAddress ??
      'unknown';

    return userId ?? ip;
  }

  private getLimit(
    request: AuthenticatedRequest,
    config: RateLimitConfig,
  ): number {
    const isPremium = request.user?.membership?.tier !== 'free';
    return isPremium && config.limitPremium !== undefined
      ? config.limitPremium
      : config.limit;
  }

  private async incrementCounter(
    key: string,
    count: number,
    ttl: number,
  ): Promise<void> {
    if (count === 0) {
      await this.redis.setex(key, ttl, 1);
    } else {
      await this.redis.incr(key);
    }
  }
}
