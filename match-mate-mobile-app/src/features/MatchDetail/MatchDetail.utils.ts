import { DiscoveryProfile } from '@/store/services/matchApi.service';
import { resolveApiUrl } from '@/core/utils/config';
import {
  FALLBACK_PHOTO,
  ONLINE_THRESHOLD_MS,
  EMPTY,
} from './MatchDetail.constants';

export const getProfileName = (profile?: DiscoveryProfile): string =>
  [profile?.personal?.firstName, profile?.personal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'MatchMate Member';

export const getPhotos = (profile?: DiscoveryProfile): string[] => {
  const photos = profile?.images
    ?.filter((img) => img.isActive !== false)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((img) => resolveApiUrl(img.url))
    .filter((url): url is string => Boolean(url));
  return photos?.length ? photos : [FALLBACK_PHOTO as string];
};

export const isRecentlyActive = (lastActiveAt?: string): boolean =>
  lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() <= ONLINE_THRESHOLD_MS
    : false;

export const compact = (
  values: Array<string | number | undefined | null>
): string => values.filter(Boolean).join(', ') || EMPTY;
