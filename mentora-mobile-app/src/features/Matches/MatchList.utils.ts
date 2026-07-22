import { DiscoveryProfile } from '@/store/services/matchApi.service';
import { resolveApiUrl } from '@/core/utils/config';
import { cmToFeetInches, formatEnumLabel } from '@/core/utils/format';
import {
  FALLBACK_PROFILE_PHOTO,
  NEW_PROFILE_THRESHOLD_MS,
  ONLINE_THRESHOLD_MS,
} from '@/core/constants';
import { MatchItem } from './MatchList.types';

export const isOnline = (lastActiveAt?: string): boolean =>
  lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() <= ONLINE_THRESHOLD_MS
    : false;

export const isNew = (createdAt?: string): boolean =>
  createdAt
    ? Date.now() - new Date(createdAt).getTime() <= NEW_PROFILE_THRESHOLD_MS
    : false;

export const getProfileName = (profile: DiscoveryProfile): string =>
  [profile.personal?.firstName, profile.personal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Mentora Member';

const getFirstNonEmpty = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }

  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const getDisplayValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return getFirstNonEmpty(...value.map(getDisplayValue));
  }

  if (value && typeof value === 'object') {
    const record = asRecord(value);
    return getFirstNonEmpty(
      record.label,
      record.name,
      record.value,
      record.key
    );
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return getFirstNonEmpty(value);
  }

  return undefined;
};

export const formatMatchEducation = (
  profile: DiscoveryProfile,
  t: (key: string, options: { defaultValue: string }) => string
): string => {
  const profileRecord = asRecord(profile);
  const personalRecord = asRecord(profile.personal);
  const educationRecord = asRecord(profile.education);
  const qualification = getDisplayValue(
    profile.education?.qualification ??
      educationRecord.qualification ??
      profileRecord.qualification ??
      personalRecord.qualification
  );
  if (qualification) {
    return formatEnumLabel(t, 'options.qualifications', qualification, '-');
  }

  return (
    getFirstNonEmpty(
      getDisplayValue(profile.education?.field ?? educationRecord.field),
      getDisplayValue(
        profile.education?.university ?? educationRecord.university
      ),
      getDisplayValue(profile.education?.jobRole ?? educationRecord.jobRole),
      getDisplayValue(
        profile.education?.occupation ?? educationRecord.occupation
      ),
      getDisplayValue(
        profile.education?.occupationType ?? educationRecord.occupationType
      )
    ) ?? '-'
  );
};

export const mapToMatchItem = (
  profile: DiscoveryProfile,
  matchedIds: Set<string>,
  shortlistedIds: Set<string>,
  pendingInterestByUserId: Map<string, string>,
  t: (key: string, options: { defaultValue: string }) => string
): MatchItem => {
  const pendingInterestId = pendingInterestByUserId.get(profile.userId);
  const photo = profile.images
    ?.filter((img) => img.isActive !== false)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((img) => resolveApiUrl(img.url))
    .find((url): url is string => Boolean(url));

  return {
    id: profile.userId,
    name: getProfileName(profile),
    age: profile.age ?? 0,
    height: profile.physical?.height
      ? cmToFeetInches(profile.physical.height) ||
        String(profile.physical.height)
      : '-',
    religion: [
      formatEnumLabel(t, 'options.religion', profile.personal?.religion, '-'),
      formatEnumLabel(
        t,
        'options.caste',
        profile.personal?.religiousDetails?.caste,
        '-'
      ),
    ]
      .filter((value) => value !== '-')
      .join(' · '),
    caste: formatEnumLabel(
      t,
      'options.caste',
      profile.personal?.religiousDetails?.caste,
      '-'
    ),
    education: formatMatchEducation(profile, t),
    profession:
      profile.education?.jobRole ?? profile.education?.occupation ?? '-',
    location:
      [profile.personal?.city, profile.personal?.state]
        .filter(Boolean)
        .join(', ') || '-',
    avatarUrl: photo ?? (FALLBACK_PROFILE_PHOTO as string),
    isOnline: isOnline(profile.lastActiveAt),
    isNew: isNew(profile.createdAt),
    isMatched:
      profile.relationship?.isMatched === true ||
      profile.privacy?.isMatched === true ||
      matchedIds.has(profile.userId),
    shouldBlurPhoto: profile.privacy?.photosBlurred === true,
    isShortlisted:
      profile.isShortlisted === true || shortlistedIds.has(profile.userId),
    isInterestPending: pendingInterestByUserId.has(profile.userId),
    ...(pendingInterestId ? { interestId: pendingInterestId } : {}),
    ...(profile.curation?.id ? { curationId: profile.curation.id } : {}),
    ...(profile.curation?.note ? { curationNote: profile.curation.note } : {}),
  };
};

export const mergeByKey = <T>(
  current: T[],
  next: T[],
  getKey: (item: T) => string
): T[] => {
  const byKey = new Map(current.map((item) => [getKey(item), item]));
  next.forEach((item) => byKey.set(getKey(item), item));
  return [...byKey.values()];
};
