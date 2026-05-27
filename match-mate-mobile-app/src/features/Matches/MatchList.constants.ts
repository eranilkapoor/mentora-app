import { Caste } from '@/core/types';
import { AgeRangeKey, CasteFilterKey } from './MatchList.types';

export const FALLBACK_PHOTO = '../../assets/images/avatar-placeholder.png';

export const FEED_PAGE_SIZE = 10;
export const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;
export const NEW_PROFILE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

export const AGE_FILTERS: Array<{
  key: AgeRangeKey;
  labelKey: string;
  minAge?: number;
  maxAge?: number;
}> = [
  { key: 'any', labelKey: 'matches.filter_age_any' },
  {
    key: '18-25',
    labelKey: 'matches.filter_age_18_25',
    minAge: 18,
    maxAge: 25,
  },
  {
    key: '26-32',
    labelKey: 'matches.filter_age_26_32',
    minAge: 26,
    maxAge: 32,
  },
  {
    key: '33-40',
    labelKey: 'matches.filter_age_33_40',
    minAge: 33,
    maxAge: 40,
  },
];

export const CASTE_FILTERS: Array<{ key: CasteFilterKey; labelKey: string }> = [
  { key: 'any', labelKey: 'matches.filter_caste_any' },
  { key: 'general' as Caste, labelKey: 'matches.filter_caste_general' },
  { key: 'obc' as Caste, labelKey: 'matches.filter_caste_obc' },
  { key: 'sc' as Caste, labelKey: 'matches.filter_caste_sc' },
];

export const TAB_CONFIG = [
  { key: 'recommended', labelKey: 'matches.tab_recommended', icon: 'star' },
  { key: 'new', labelKey: 'matches.tab_new', icon: 'zap' },
  { key: 'nearby', labelKey: 'matches.tab_nearby', icon: 'map-pin' },
  { key: 'matched', labelKey: 'matches.tab_matched', icon: 'heart' },
  { key: 'shortlisted', labelKey: 'matches.tab_shortlisted', icon: 'bookmark' },
  { key: 'requests', labelKey: 'matches.tab_requests', icon: 'inbox' },
] as const;
