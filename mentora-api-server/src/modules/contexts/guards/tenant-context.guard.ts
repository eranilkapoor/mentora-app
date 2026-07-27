import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { ContextsService } from '../services/contexts.service';

type TenantScopedRequest = AuthenticatedRequest;

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(private readonly contextsService: ContextsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TenantScopedRequest>();
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return true;
    }

    if (!request.user?.sub) {
      throw new UnauthorizedException('Authenticated CRM user is required');
    }

    await this.contextsService.assertUserTenantAccess(
      request.user.sub,
      tenantId,
    );
    return true;
  }

  private getTenantId(request: TenantScopedRequest): string | undefined {
    return (
      this.asString(this.getField(request.query, 'tenantId')) ??
      this.asString(this.getField(request.body, 'tenantId')) ??
      this.asString(this.getField(request.params, 'tenantId'))
    );
  }

  private getField(source: unknown, field: string): unknown {
    if (!source || typeof source !== 'object') {
      return undefined;
    }

    return (source as Record<string, unknown>)[field];
  }

  private asString(value: unknown): string | undefined {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    if (Array.isArray(value)) {
      return this.asString(value[0]);
    }

    return undefined;
  }
}
