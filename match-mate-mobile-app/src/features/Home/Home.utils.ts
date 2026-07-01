import { DiscoveryProfile } from '@/store/services/matchApi.service';
import { resolveApiUrl } from '@/core/utils/config';
import { cmToFeetInches, formatEnumLabel } from '@/core/utils/format';
import {
  FALLBACK_PHOTO,
  ONLINE_THRESHOLD_MS,
  NEW_PROFILE_THRESHOLD_MS,
} from './Home.constants';
import { HomeMatchProfile } from './Home.types';

export const isRecentlyActive = (lastActiveAt?: string): boolean =>
  lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() <= ONLINE_THRESHOLD_MS
    : false;

export const isNewProfile = (createdAt?: string): boolean =>
  createdAt
    ? Date.now() - new Date(createdAt).getTime() <= NEW_PROFILE_THRESHOLD_MS
    : false;

export const profileName = (profile: DiscoveryProfile): string =>
  [profile.personal?.firstName, profile.personal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Match Mate Member';

export const mapProfile = (
  profile: DiscoveryProfile,
  matchedIds: Set<string>,
  shortlistedIds: Set<string>,
  pendingInterestByUserId: Map<string, string>,
  t: (key: string, options: { defaultValue: string }) => string
): HomeMatchProfile => {
  const pendingInterestId = pendingInterestByUserId.get(profile.userId);

  const photos =
    profile.images
      ?.filter((image) => image.isActive !== false)
      .sort(
        (a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary))
      )
      .map((image) => resolveApiUrl(image.url))
      .filter((url): url is string => Boolean(url)) ?? [];

  return {
    userId: profile.userId,
    name: profileName(profile),
    age: profile.age ?? 0,
    height: profile.physical?.height
      ? cmToFeetInches(profile.physical.height) ||
        String(profile.physical.height)
      : '-',
    location:
      [profile.personal?.city, profile.personal?.state]
        .filter(Boolean)
        .join(', ') || '-',
    religion: [
      formatEnumLabel(t, 'options.religion', profile.personal?.religion, '-'),
      formatEnumLabel(t, 'options.caste', profile.personal?.caste, '-'),
    ]
      .filter((v) => v !== '-')
      .join(' · '),
    education: formatEnumLabel(
      t,
      'options.qualifications',
      profile.education?.qualification,
      '-'
    ),
    profession:
      profile.education?.jobRole ?? profile.education?.occupation ?? '-',
    isOnline: isRecentlyActive(profile.lastActiveAt),
    isNew: isNewProfile(profile.createdAt),
    photos: photos.length > 0 ? photos : [FALLBACK_PHOTO as string],
    isMatched:
      profile.relationship?.isMatched === true ||
      profile.privacy?.isMatched === true ||
      matchedIds.has(profile.userId),
    isShortlisted:
      profile.isShortlisted === true || shortlistedIds.has(profile.userId),
    isInterestPending: pendingInterestByUserId.has(profile.userId),
    ...(pendingInterestId ? { interestId: pendingInterestId } : {}),
  };
};
