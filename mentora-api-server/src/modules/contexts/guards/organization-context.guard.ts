import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { ContextsService } from '../services/contexts.service';

type OrganizationScopedRequest = AuthenticatedRequest;

@Injectable()
export class OrganizationContextGuard implements CanActivate {
  constructor(private readonly contextsService: ContextsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OrganizationScopedRequest>();
    const organizationId = this.getOrganizationId(request);

    if (!organizationId) {
      return true;
    }

    if (!request.user?.sub) {
      throw new UnauthorizedException('Authenticated CRM user is required');
    }

    if (request.user.roles?.includes(Role.SUPER_ADMIN)) {
      return true;
    }

    await this.contextsService.assertUserOrganizationAccess(
      request.user.sub,
      organizationId,
    );
    return true;
  }

  private getOrganizationId(
    request: OrganizationScopedRequest,
  ): string | undefined {
    return (
      this.asString(this.getField(request.query, 'organizationId')) ??
      this.asString(this.getField(request.body, 'organizationId')) ??
      this.asString(this.getField(request.params, 'organizationId'))
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
