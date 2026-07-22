import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createHash, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { INTERNAL_API_KEY_REQUIRED } from '@/common/decorators/internal-api-key.decorator';
import { ErrorCode } from '@/common/constants';
import {
  throwForbidden,
  throwUnauthorized,
} from '@/common/exceptions/throw-app-exception';

const normalizeKeyList = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

const digest = (value: string): Buffer =>
  createHash('sha256').update(value, 'utf8').digest();

const constantTimeEquals = (left: string, right: string): boolean =>
  timingSafeEqual(digest(left), digest(right));

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isRequired = this.reflector.getAllAndOverride<boolean>(
      INTERNAL_API_KEY_REQUIRED,
      [context.getHandler(), context.getClass()],
    );

    if (!isRequired) return true;

    const configuredKeys = normalizeKeyList(
      this.configService.get<string>('INTERNAL_API_KEYS'),
    );

    if (!configuredKeys.length) {
      return throwForbidden(ErrorCode.ACCESS_DENIED, {
        reason: 'internal_api_key_not_configured',
      });
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.header('x-api-key')?.trim();

    if (!providedKey) {
      return throwUnauthorized(ErrorCode.AUTH_UNAUTHORIZED, {
        reason: 'internal_api_key_required',
      });
    }

    const matched = configuredKeys.some((key) =>
      constantTimeEquals(providedKey, key),
    );

    if (!matched) {
      return throwForbidden(ErrorCode.ACCESS_DENIED, {
        reason: 'internal_api_key_invalid',
      });
    }

    return true;
  }
}
