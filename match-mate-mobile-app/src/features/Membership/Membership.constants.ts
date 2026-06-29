import { MembershipTab, StatItem, TrustBadge } from './Membership.types';

export const MEMBERSHIP_TABS: Array<{
  key: MembershipTab;
  labelKey: string;
  icon: string;
}> = [
  { key: 'self', labelKey: 'membership.tab_self', icon: 'user' },
  { key: 'assisted', labelKey: 'membership.tab_assisted', icon: 'users' },
  {
    key: 'enterprise',
    labelKey: 'membership.tab_enterprise',
    icon: 'briefcase',
  },
];

export const HERO_STATS: StatItem[] = [
  {
    valueKey: 'membership.stat_members_value',
    labelKey: 'membership.stat_members_label',
  },
  {
    valueKey: 'membership.stat_faster_value',
    labelKey: 'membership.stat_faster_label',
  },
  {
    valueKey: 'membership.stat_success_value',
    labelKey: 'membership.stat_success_label',
  },
];

export const SELF_TRUST_BADGES: TrustBadge[] = [
  { icon: 'lock', labelKey: 'membership.trust_secure' },
  { icon: 'check-circle', labelKey: 'membership.trust_verified' },
  { icon: 'message-circle', labelKey: 'membership.trust_support' },
];

export const ASSISTED_TRUST_BADGES: TrustBadge[] = [
  { icon: 'lock', labelKey: 'membership.trust_secure' },
  { icon: 'check-circle', labelKey: 'membership.trust_verified' },
  { icon: 'award', labelKey: 'membership.trust_members' },
];

export const ENTERPRISE_TRUST_BADGES: TrustBadge[] = [
  { icon: 'shield', labelKey: 'membership.enterprise_governance' },
  { icon: 'sliders', labelKey: 'membership.enterprise_configurable' },
  { icon: 'headphones', labelKey: 'membership.enterprise_sla' },
];
