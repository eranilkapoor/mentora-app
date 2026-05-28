import { Caste } from '@/core/types';
import {
  ActivityFilterKey,
  AgeRangeKey,
  CasteFilterKey,
  EducationFilterKey,
  FilterState,
  HeightFilterKey,
  MaritalStatusFilterKey,
} from './MatchList.types';

export const FEED_PAGE_SIZE = 10;
export const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;
export const NEW_PROFILE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

export const FALLBACK_PHOTO = '../../assets/images/avatar-placeholder.png';

export const DEFAULT_FILTERS: FilterState = {
  cityFilter: '',
  ageFilter: 'any',
  casteFilter: 'any',
  verifiedOnly: false,
  heightFilter: 'any',
  maritalStatusFilter: 'any',
  educationFilter: 'any',
  activityFilter: 'any',
  premiumOnly: false,
  withPhotoOnly: false,
};

// ─── Tab config ───────────────────────────────────────────────────────────────

export const TAB_CONFIG = [
  { key: 'recommended', labelKey: 'matches.tab_recommended', icon: 'star' },
  { key: 'new', labelKey: 'matches.tab_new', icon: 'zap' },
  { key: 'nearby', labelKey: 'matches.tab_nearby', icon: 'map-pin' },
  { key: 'matched', labelKey: 'matches.tab_matched', icon: 'heart' },
  { key: 'shortlisted', labelKey: 'matches.tab_shortlisted', icon: 'bookmark' },
  { key: 'requests', labelKey: 'matches.tab_requests', icon: 'inbox' },
] as const;

// ─── Filter option arrays ─────────────────────────────────────────────────────

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

export const HEIGHT_FILTERS: Array<{ key: HeightFilterKey; labelKey: string }> =
  [
    { key: 'any', labelKey: 'matches.filter_height_any' },
    { key: 'short', labelKey: 'matches.filter_height_short' },
    { key: 'medium', labelKey: 'matches.filter_height_medium' },
    { key: 'tall', labelKey: 'matches.filter_height_tall' },
  ];

export const MARITAL_STATUS_FILTERS: Array<{
  key: MaritalStatusFilterKey;
  labelKey: string;
}> = [
  { key: 'any', labelKey: 'matches.filter_marital_any' },
  { key: 'never_married', labelKey: 'matches.filter_marital_never_married' },
  { key: 'divorced', labelKey: 'matches.filter_marital_divorced' },
  { key: 'widowed', labelKey: 'matches.filter_marital_widowed' },
];

export const EDUCATION_FILTERS: Array<{
  key: EducationFilterKey;
  labelKey: string;
}> = [
  { key: 'any', labelKey: 'matches.filter_education_any' },
  { key: 'graduate', labelKey: 'matches.filter_education_graduate' },
  { key: 'post_graduate', labelKey: 'matches.filter_education_post_graduate' },
  { key: 'doctorate', labelKey: 'matches.filter_education_doctorate' },
];

export const ACTIVITY_FILTERS: Array<{
  key: ActivityFilterKey;
  labelKey: string;
}> = [
  { key: 'any', labelKey: 'matches.filter_activity_any' },
  { key: 'online', labelKey: 'matches.filter_activity_online' },
  {
    key: 'recently_active',
    labelKey: 'matches.filter_activity_recently_active',
  },
  { key: 'new_profiles', labelKey: 'matches.filter_activity_new_profiles' },
];

export const QUICK_TOGGLES = [
  {
    key: 'verifiedOnly' as const,
    labelKey: 'matches.filter_verified_only',
    icon: 'check-circle',
  },
  {
    key: 'withPhotoOnly' as const,
    labelKey: 'matches.filter_with_photo',
    icon: 'image',
  },
  {
    key: 'premiumOnly' as const,
    labelKey: 'matches.filter_premium_only',
    icon: 'award',
  },
] satisfies Array<{
  key: keyof Pick<
    FilterState,
    'verifiedOnly' | 'withPhotoOnly' | 'premiumOnly'
  >;
  labelKey: string;
  icon: string;
}>;
