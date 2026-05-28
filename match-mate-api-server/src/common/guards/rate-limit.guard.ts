import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import {
  RATE_LIMIT_KEY,
  RateLimitConfig,
} from '../decorators/rate-limit.decorator';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import { SKIP_RATE_LIMIT_KEY } from '../decorators/skip-rate-limit.decorator';
import { AppLogger } from '../logger/logger.service';

//  Types

interface AuthenticatedUser {
  sub?: string;
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

//  Guard

@Injectable()
export class RateLimitGuard implements CanActivate {
  private locks = new Map<string, Promise<void>>();

  constructor(
    private readonly logger: AppLogger,
    private readonly reflector: Reflector,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skip) return true;

    const rateLimitConfig = this.reflector.getAllAndOverride<RateLimitConfig>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    const method = request.method;
    const handlerName = context.getHandler().name;
    const requestObject = request as unknown as Record<string, unknown>;
    const route = requestObject['route'];
    const rawRoutePath =
      typeof route === 'object' && route !== null
        ? (route as Record<string, unknown>)['path']
        : undefined;
    const routePath =
      typeof rawRoutePath === 'string' ? rawRoutePath : handlerName;
    const identifier = this.getIdentifier(request);
    const key = `rate-limit:${rateLimitConfig.name}:${method}:${routePath}:${identifier}`;
    const limit = this.getLimit(request, rateLimitConfig);
    const { ttl } = rateLimitConfig;

    const now = Date.now();
    const release = await this.acquireLock(key);

    try {
      const blocked = await this.cache.get(`blocked:${identifier}`);
      if (blocked) {
        throw new HttpException('Too many requests. Try later.', 429);
      }

      //  Get or init entry
      let entry = await this.cache.get<RateLimitEntry>(key);

      let isNew = false;

      if (!entry) {
        isNew = true;
        entry = {
          count: 0,
          expiresAt: now + ttl * 1000,
        };
      }

      const remainingTtlSeconds = Math.max(
        0,
        Math.ceil((entry.expiresAt - now) / 1000),
      );

      //  Set response headers
      response.setHeader('X-RateLimit-Limit', limit);
      response.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, limit - entry.count - 1),
      );
      response.setHeader(
        'X-RateLimit-Reset',
        Math.floor(entry.expiresAt / 1000),
      );

      if (entry.count > limit * 2) {
        await this.cache.set(`blocked:${identifier}`, true, 3600);
      }

      //  Check limit
      if (entry.count >= limit) {
        response.setHeader('Retry-After', remainingTtlSeconds);

        this.logger.warn(
          `Rate limit exceeded  identifier: ${identifier}, key: ${key}, count: ${entry.count}/${limit}`,
        );

        const errorResponse: RateLimitErrorResponse = {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: rateLimitConfig.message,
          retryAfter: remainingTtlSeconds,
          resetAt: entry.expiresAt,
        };

        throw new HttpException(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
      }

      //  Increment
      const updatedEntry: RateLimitEntry = {
        count: entry.count + 1,
        expiresAt: entry.expiresAt,
      };

      //  Save
      const safeTtl = remainingTtlSeconds > 0 ? remainingTtlSeconds : ttl;
      if (isNew) {
        await this.cache.set<RateLimitEntry>(key, updatedEntry, ttl);
      } else {
        await this.cache.set<RateLimitEntry>(key, updatedEntry, safeTtl);
      }
    } finally {
      release();
    }

    return true;
  }

  //  Helpers

  private async acquireLock(key: string) {
    while (this.locks.get(key)) {
      await this.locks.get(key);
    }

    let release: () => void;
    const lock = new Promise<void>((res) => (release = res));
    this.locks.set(key, lock);

    return () => {
      this.locks.delete(key);

      // cleanup safety
      if (this.locks.size > 10000) {
        this.locks.clear();
      }

      release();
    };
  }

  private getIdentifier(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      request.socket?.remoteAddress ??
      request.ip ??
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
