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

//  Guard

@Injectable()
export class RateLimitGuard implements CanActivate {
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

    const blocked = await this.cache.get(`blocked:${identifier}`);
    if (blocked) {
      throw new HttpException('Too many requests. Try later.', 429);
    }

    const counter = await this.cache.incrementWithExpiry(key, ttl);
    const remainingTtlSeconds = Math.max(0, counter.ttlSeconds);
    const resetAt = Date.now() + remainingTtlSeconds * 1000;

    //  Set response headers
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, limit - counter.value),
    );
    response.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000));

    if (counter.value > limit * 2) {
      await this.cache.set(`blocked:${identifier}`, true, 3600);
    }

    //  Check limit
    if (counter.value > limit) {
      response.setHeader('Retry-After', remainingTtlSeconds);

      this.logger.warn(
        `Rate limit exceeded identifier: ${identifier}, key: ${key}, count: ${counter.value}/${limit}`,
      );

      const errorResponse: RateLimitErrorResponse = {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: rateLimitConfig.message,
        retryAfter: remainingTtlSeconds,
        resetAt,
      };

      throw new HttpException(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  //  Helpers

  private getIdentifier(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown';

    return userId ?? ip;
  }

  private getLimit(
    request: AuthenticatedRequest,
    config: RateLimitConfig,
  ): number {
    const tier = request.user?.membership?.tier;
    const isPremium = Boolean(tier && tier !== 'free');
    return isPremium && config.limitPremium !== undefined
      ? config.limitPremium
      : config.limit;
  }
}
