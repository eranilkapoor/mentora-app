import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@/common/constants';
import { Permission, Role } from '@/common/enums';
import { throwBadRequest } from '@/common/exceptions/throw-app-exception';
import { JwtUser } from '@/modules/auth/interfaces/jwt-user.interface';

const platformOnlyOrganizationFields = new Set([
  'billingCycle',
  'customDomain',
  'enabledModules',
  'leadLimit',
  'plan',
  'storageLimitGb',
  'subscription',
  'subscriptionEnd',
  'subscriptionStart',
  'trialEnd',
  'trialStart',
  'userLimit',
]);

const platformOnlyChannelFields = new Set([
  'credentialsRef',
  'provider',
  'providerKey',
]);

@Injectable()
export class OrganizationFieldPolicyService {
  assertCanUpdateOrganization(
    actor: JwtUser | undefined,
    payload: Record<string, unknown>,
  ) {
    if (this.isPlatformAdmin(actor)) return;
    this.assertNoRestrictedFields(
      payload,
      platformOnlyOrganizationFields,
      'organization',
    );
  }

  assertCanUpdateChannelSetting(
    actor: JwtUser | undefined,
    payload: Record<string, unknown>,
  ) {
    if (this.isPlatformAdmin(actor)) return;
    this.assertNoRestrictedFields(
      payload,
      platformOnlyChannelFields,
      'channel_setting',
    );
  }

  private isPlatformAdmin(actor: JwtUser | undefined) {
    return Boolean(
      actor?.roles?.includes(Role.SUPER_ADMIN) ||
      actor?.permissions?.includes(Permission.SYSTEM_CONFIG),
    );
  }

  private assertNoRestrictedFields(
    payload: Record<string, unknown>,
    restrictedFields: Set<string>,
    scope: string,
  ) {
    const fields = Object.keys(payload).filter((field) =>
      restrictedFields.has(field),
    );
    if (fields.length === 0) return;

    throwBadRequest(ErrorCode.AUTH_FORBIDDEN, {
      fields,
      reason: `${scope}_field_restricted_to_platform_admin`,
    });
  }
}
