import { resolveBundledAssetUri } from '@/core/utils/assets';

export const FALLBACK_PROFILE_PHOTO = resolveBundledAssetUri(
  require('@/assets/images/avatar-placeholder.png')
);

export const PROFILE_FEED_PAGE_SIZE = 10;
export const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;
export const NEW_PROFILE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;
export const EMPTY_DISPLAY_VALUE = '-';
