import { DiscoveryProfile } from '@/store/services/matchApi.service';
import { resolveApiUrl } from '@/core/utils/config';
import {
  EMPTY_DISPLAY_VALUE,
  FALLBACK_PROFILE_PHOTO,
  ONLINE_THRESHOLD_MS,
} from '@/core/constants';

export const getProfileName = (profile?: DiscoveryProfile): string =>
  [profile?.personal?.firstName, profile?.personal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Mentora Member';

export const getPhotos = (profile?: DiscoveryProfile): string[] => {
  return getPhotoItems(profile).map((photo) => photo.url);
};

export interface DetailPhotoItem {
  url: string;
  isBlurred: boolean;
  blurReason?: string;
}

export const getPhotoItems = (
  profile?: DiscoveryProfile
): DetailPhotoItem[] => {
  const photos = profile?.images
    ?.filter((img) => img.isActive !== false)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((img) => {
      const url = resolveApiUrl(img.url);
      return url
        ? {
            url,
            isBlurred: Boolean(img.isBlurred),
            ...(img.blurReason ? { blurReason: img.blurReason } : {}),
          }
        : null;
    })
    .filter((photo): photo is DetailPhotoItem => Boolean(photo));
  return photos?.length
    ? photos
    : [{ url: FALLBACK_PROFILE_PHOTO as string, isBlurred: false }];
};

export const isRecentlyActive = (lastActiveAt?: string): boolean =>
  lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() <= ONLINE_THRESHOLD_MS
    : false;

export const compact = (
  values: Array<string | number | undefined | null>
): string => values.filter(Boolean).join(', ') || EMPTY_DISPLAY_VALUE;
