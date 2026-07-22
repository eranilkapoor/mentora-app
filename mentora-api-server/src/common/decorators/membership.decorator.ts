import { SetMetadata } from '@nestjs/common';

export const MEMBERSHIP_KEY = 'membership';

export const RequireMembership = (tier: string) =>
  SetMetadata(MEMBERSHIP_KEY, tier);
