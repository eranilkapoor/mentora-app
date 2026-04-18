import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FEATURE_KEY } from '../decorators/feature.decorator';
import { FeatureKey } from 'src/common/enums';
import { FeatureService } from '../services/feature.service';

interface RequestWithUser {
  ip: string;
  headers: Record<string, unknown>;
  feature?: unknown;
  user?: {
    sub: string;
  };
}

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureService: FeatureService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<FeatureKey>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!feature) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user?.sub) {
      throw new ForbiddenException('Unauthorized');
    }

    const contextData = {
      userId: user.sub,
      deviceId: this.getHeaderValue(request.headers['x-device-id']),
      platform: this.getHeaderValue(request.headers['x-platform']),
      ip: request.ip,
      timestamp: new Date(),
    };

    const result = await this.featureService.checkAccess(feature, contextData);

    // Attach to request (optional)
    request.feature = result;

    return true;
  }

  private getHeaderValue(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'string'
    ) {
      return value[0];
    }

    return undefined;
  }
}
