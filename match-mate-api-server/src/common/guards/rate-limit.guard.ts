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
import { Request, Response } from 'express';
import {
  RATE_LIMIT_KEY,
  RateLimitConfig,
} from '../decorators/rate-limit.decorator';
import type { ICacheService } from 'src/modules/cache/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/cache.interface';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// Store count + expiry together so we don't need raw Redis TTL command
interface RateLimitEntry {
  count: number;
  expiresAt: number; // unix ms
}

// ─── Guard ────────────────────────────────────────────────────────────────────

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
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
    const limit = this.getLimit(request, rateLimitConfig);
    const { ttl } = rateLimitConfig;

    // ─── Get or init entry ──────────────────────────────────────────────────
    const now = Date.now();
    let entry = await this.cache.get<RateLimitEntry>(key);

    if (!entry) {
      // First request — initialize
      entry = {
        count: 0,
        expiresAt: now + ttl * 1000,
      };
    }

    const remainingTtlSeconds = Math.max(
      0,
      Math.ceil((entry.expiresAt - now) / 1000),
    );

    // ─── Set response headers ───────────────────────────────────────────────

    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, limit - entry.count - 1),
    );
    response.setHeader('X-RateLimit-Reset', Math.floor(entry.expiresAt / 1000));

    // ─── Check limit ────────────────────────────────────────────────────────
    if (entry.count >= limit) {
      response.setHeader('Retry-After', remainingTtlSeconds);

      this.logger.warn(
        `Rate limit exceeded — identifier: ${identifier}, key: ${key}, count: ${entry.count}/${limit}`,
      );

      const errorResponse: RateLimitErrorResponse = {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: rateLimitConfig.message,
        retryAfter: remainingTtlSeconds,
        resetAt: entry.expiresAt,
      };

      throw new HttpException(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
    }

    // ─── Increment and save ─────────────────────────────────────────────────
    await this.cache.set<RateLimitEntry>(
      key,
      { count: entry.count + 1, expiresAt: entry.expiresAt },
      remainingTtlSeconds,
    );

    return true;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

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
}
