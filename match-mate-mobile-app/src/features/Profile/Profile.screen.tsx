import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  annualIncomeFormat,
  cmToFeetInches,
  formatEnumLabel,
  formatAboutMe,
  formatCamelCase,
  formatWeight,
  getAgeFromDOB,
  getFullName,
} from '../../core/utils/format';
import Header from '../../core/components/Header';
import { useGetMyProfileQuery } from '../../store/services/profileApi.service';
import { useGetPrivacySettingsQuery } from '@/store/services/privacySettingsApi.service';
import {
  Countries,
  Genders,
  MaritalStatuses,
  Religions,
  SmokingHabits,
  DrinkingHabits,
  EatingHabits,
} from '../../core/types';
import { getResponsiveMediaWidth } from '../../core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from './Profile.styles';
import {
  PdfAction,
  Primitive,
  ProfileScreenProps,
  SchemaProfile,
  SiblingDisplayItem,
} from './Profile.types';
import { PrivacySettings } from '@/features/PrivacySettings/PrivacySettings.types';
import { FALLBACK_PHOTO, FALLBACK_PHOTOS } from './Profile.constants';
import { ProfileSkeleton } from './components/ProfileSkeleton';
import { Section } from './components/Section';
import { Row } from './components/Row';
import { TagList } from './components/TagList';
import { showError } from '@/core/utils/toast';
import {
  getPersonalityBadgeIcon,
  getPersonalityBadgeLabel,
} from '@/core/utils/personalityBadges';
import { useTheme } from '@/core/theme/ThemeProvider';
import { resolveApiUrl } from '@/core/utils/config';
import { InlineVideoPlayer } from '@/core/components/media/InlineVideoPlayer';
import { useMediaSettings } from '@/features/MediaSettings/useMediaSettings';
import { usePlanFeatureAccess } from '@/features/Membership/hooks/usePlanFeatureAccess';
import { useUpgradePrompt } from '@/features/Membership/hooks/useUpgradePrompt';

const UPLOAD_VIDEOS_FEATURE = 'upload_videos';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_VALUE = '—';
const MASKED_VALUE = '••••';

// ─── Default profile ──────────────────────────────────────────────────────────

const DEFAULT_PROFILE: SchemaProfile = {
  profileFor: 'self',
  personal: {
    firstName: '',
    lastName: '',
    gender: Genders.MALE,
    dateOfBirth: '',
    religion: Religions.HINDU,
    religiousDetails: {},
    country: Countries.INDIA,
    state: '',
    city: '',
    motherTongue: '',
    maritalStatus: MaritalStatuses.NEVER_MARRIED,
    aboutMe: '',
    smoking: SmokingHabits.NON_SMOKER,
    drinking: DrinkingHabits.NON_DRINKER,
    eating: EatingHabits.EGGETARIAN,
    hobbies: [],
    personalityBadges: [],
    languages: [],
    languagesKnown: [],
  },
  physical: { height: '', weight: '', bodyType: '', complexion: '' },
  education: {
    qualification: '',
    field: '',
    university: '',
    occupation: '',
    annualIncomeAmount: 0,
  },
  family: {
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    familyType: '',
    familyStatus: '',
    familyValues: '',
  },
  preferences: { languagesKnown: [] },
  images: [],
  videoIntro: null,
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const getProfilePhotos = (images?: SchemaProfile['images']): string[] => {
  const resolved =
    images
      ?.filter((img) => img.isActive !== false)
      .sort(
        (a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary))
      )
      .map((img) => resolveApiUrl(img.url))
      .filter(
        (url): url is string => typeof url === 'string' && url.length > 0
      ) ?? [];

  return resolved.length > 0 ? resolved : FALLBACK_PHOTOS;
};

// Only URLs we can embed in PDF (absolute https or base64 data URIs)
const getPrintableProfilePhoto = (
  images?: SchemaProfile['images']
): string | undefined =>
  images
    ?.filter((img) => img.isActive !== false)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((img) => resolveApiUrl(img.url))
    .find(
      (url): url is string =>
        typeof url === 'string' && /^(https:|http:|data:)/i.test(url.trim())
    );

const canEmbedPhotoInPdf = (privacy: PrivacySettings | undefined): boolean => {
  if (!privacy) return false;
  return privacy.showPhotosTo === 'everyone' && !privacy.blurPhotosForUnmatched;
};

const toDisplayText = (value: Primitive): string => {
  if (value === undefined || value === null) return EMPTY_VALUE;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > 0 ? text : EMPTY_VALUE;
};

const formatProfileText = (value: Primitive): string => {
  return toDisplayText(value);
};

const formatDateTime = (value: string | Date | undefined): string => {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFormattedAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return EMPTY_VALUE;
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  return getAgeFromDOB(dateOfBirth);
};

const getFormattedHeight = (height: string | number | undefined): string =>
  cmToFeetInches(height ?? '') || EMPTY_VALUE;

const getFormattedWeight = (weight: string | number | undefined): string =>
  formatWeight(weight ?? '') || EMPTY_VALUE;

const getDisplayName = (profile: SchemaProfile): string => {
  const name = getFullName(
    profile.personal.firstName ?? '',
    profile.personal.lastName ?? ''
  ).trim();
  return name || EMPTY_VALUE;
};

const getLocation = (profile: SchemaProfile): string =>
  [
    formatProfileText(profile.personal.city),
    formatProfileText(profile.personal.state),
    formatProfileText(profile.personal.country),
  ]
    .filter((v) => v !== EMPTY_VALUE)
    .join(', ') || EMPTY_VALUE;

const getProfileEmail = (profile: SchemaProfile): string => {
  const data = profile as SchemaProfile & {
    email?: string;
    user?: { email?: string };
    contactDetails?: { email?: { address?: string } };
  };

  return (
    data.contactDetails?.email?.address ??
    data.email ??
    data.user?.email ??
    EMPTY_VALUE
  );
};

const getProfilePhone = (profile: SchemaProfile): string => {
  const data = profile as SchemaProfile & {
    phone?: string | { countryCode?: string; phone?: string; number?: string };
    user?: {
      phone?:
        string | { countryCode?: string; phone?: string; number?: string };
    };
    contactDetails?: {
      phone?: { countryCode?: string; number?: string; phone?: string };
    };
  };
  const phone = data.contactDetails?.phone ?? data.phone ?? data.user?.phone;

  if (!phone) return EMPTY_VALUE;
  if (typeof phone === 'string') return phone;

  return (
    [phone.countryCode, phone.phone ?? phone.number]
      .filter(Boolean)
      .join(' ') || EMPTY_VALUE
  );
};

const maskEmail = (email: string): string => {
  if (email === EMPTY_VALUE) return EMPTY_VALUE;
  const [name = '', domain = ''] = email.split('@');
  if (!domain) return MASKED_VALUE;
  return `${name.slice(0, 2)}•••@${domain}`;
};

const maskPhone = (phone: string): string => {
  if (phone === EMPTY_VALUE) return EMPTY_VALUE;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return MASKED_VALUE;
  return `${MASKED_VALUE}${digits.slice(-4)}`;
};

const getTimeOfBirth = (profile: SchemaProfile): string => {
  const { hour, minute, period } = profile.personal.timeOfBirth ?? {};
  const time = [hour, minute].filter(Boolean).join(':');
  if (!time && !period) return EMPTY_VALUE;
  return `${time}${period ? ` ${period}` : ''}`.trim();
};

const getPlaceOfBirth = (profile: SchemaProfile): string =>
  [
    formatProfileText(profile.personal.placeOfBirth?.city),
    formatProfileText(profile.personal.placeOfBirth?.state),
    formatProfileText(profile.personal.placeOfBirth?.country),
  ]
    .filter((v) => v !== EMPTY_VALUE)
    .join(', ') || EMPTY_VALUE;

const getChildrenSummary = (profile: SchemaProfile): string => {
  if (!profile.personal.hasChildren) return 'No';
  const sons = profile.personal.sonsCount ?? 0;
  const daughters = profile.personal.daughtersCount ?? 0;
  const parts = [
    sons > 0 ? `${sons} son${sons === 1 ? '' : 's'}` : '',
    daughters > 0 ? `${daughters} daughter${daughters === 1 ? '' : 's'}` : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Yes';
};

const hasChildren = (profile: SchemaProfile): boolean =>
  profile.personal.hasChildren === true;

const hasDisability = (profile: SchemaProfile): boolean =>
  profile.physical.disabilityStatus === true;

type Translate = (key: string, options?: Record<string, unknown>) => string;

const getSiblingCountLabel = (
  t: Translate,
  key: string,
  count: number
): string => t(`profile.siblings.${key}`, { count });

const getSiblingCounts = (profile: SchemaProfile, t: Translate): string => {
  const s = profile.family?.siblings;
  if (!s) return EMPTY_VALUE;
  const brothers = s.brothersCount ?? 0;
  const sisters = s.sistersCount ?? 0;
  const mb = s.marriedBrothersCount ?? 0;
  const ms = s.marriedSistersCount ?? 0;
  return [
    getSiblingCountLabel(t, 'brothers', brothers),
    getSiblingCountLabel(t, 'sisters', sisters),
    getSiblingCountLabel(t, 'married_brothers', mb),
    getSiblingCountLabel(t, 'married_sisters', ms),
  ].join(', ');
};

const getSiblingDetails = (
  profile: SchemaProfile,
  t: Translate
): SiblingDisplayItem[] =>
  profile.family?.siblings?.details?.map((s) => ({
    type:
      s.type === 'brother'
        ? t('profile.siblings.brother')
        : t('profile.siblings.sister'),
    maritalStatus: s.married
      ? t('profile.siblings.married')
      : t('profile.siblings.unmarried'),
    occupation: formatProfileText(s.occupation),
  })) ?? [];

const toStringList = (items: unknown): string[] =>
  Array.isArray(items)
    ? items.filter((i): i is string => typeof i === 'string')
    : [];

const formatList = (items: unknown): string =>
  toStringList(items).filter(Boolean).join(', ') || EMPTY_VALUE;

const formatEnumList = (
  t: Translate,
  namespace: string,
  items: unknown
): string => {
  const values = toStringList(items);
  if (!values.length) return EMPTY_VALUE;

  return values
    .map((value) =>
      formatEnumLabel(t, namespace, value, formatProfileText(value))
    )
    .filter((value) => value !== EMPTY_VALUE)
    .join(', ');
};

const formatNumberRange = (
  range: { min?: number | null; max?: number | null } | undefined,
  suffix = ''
): string => {
  if (!range) return EMPTY_VALUE;
  const min = typeof range.min === 'number' ? range.min : null;
  const max = typeof range.max === 'number' ? range.max : null;
  if (min === null && max === null) return EMPTY_VALUE;
  if (min !== null && max !== null) return `${min}${suffix} - ${max}${suffix}`;
  if (min !== null) return `${min}${suffix}+`;
  return `Up to ${max}${suffix}`;
};

const formatHeightPreference = (
  range: { min?: number | null; max?: number | null } | undefined
): string => {
  if (!range) return EMPTY_VALUE;
  const min = typeof range.min === 'number' ? cmToFeetInches(range.min) : '';
  const max = typeof range.max === 'number' ? cmToFeetInches(range.max) : '';
  if (min && max) return `${min} - ${max}`;
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return EMPTY_VALUE;
};

const formatIncomePreference = (
  range: { min?: number | null; max?: number | null } | undefined
): string => {
  if (!range) return EMPTY_VALUE;
  const min =
    typeof range.min === 'number' ? annualIncomeFormat(range.min) : '';
  const max =
    typeof range.max === 'number' ? annualIncomeFormat(range.max) : '';
  if (min && max) return `${min} - ${max}`;
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return EMPTY_VALUE;
};

type PdfPreferenceFields = NonNullable<SchemaProfile['preferences']> &
  NonNullable<SchemaProfile['preferences']>['filters'];

const getPreferenceFilters = (
  profile: SchemaProfile
): PdfPreferenceFields | undefined =>
  (profile.preferences?.filters ?? profile.preferences) as PdfPreferenceFields;

const getSiblingDetailsSummary = (
  profile: SchemaProfile,
  t: Translate
): string => {
  const details = getSiblingDetails(profile, t);
  if (!details.length) return EMPTY_VALUE;

  return details
    .map((sibling) =>
      [sibling.type, sibling.maritalStatus, sibling.occupation]
        .filter((value) => value && value !== EMPTY_VALUE)
        .join(' - ')
    )
    .join('; ');
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getPdfFileName = (profile: SchemaProfile): string => {
  const name = getDisplayName(profile)
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${name || 'profile'}-profile.pdf`;
};

const copyPdfToDocumentDirectory = async (
  sourceUri: string,
  profile: SchemaProfile
): Promise<string> => {
  if (!FileSystem.documentDirectory) return sourceUri;
  const dest = `${FileSystem.documentDirectory}${getPdfFileName(profile)}`;
  await FileSystem.deleteAsync(dest, { idempotent: true });
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
};

const printProfilePdfOnWeb = async (html: string): Promise<void> => {
  await Print.printAsync({ html });
};

type PdfRow = [string, string, boolean?];

interface PdfSection {
  title: string;
  rows: PdfRow[];
}

const getPdfSections = (
  profile: SchemaProfile,
  privacy: PrivacySettings | undefined,
  t: Translate
): PdfSection[] => {
  const showExactAge = privacy?.showExactAge ?? true;
  const showIncome = privacy?.showIncome ?? false;
  const showPhone = privacy?.showPhone ?? false;
  const showEmail = privacy?.showEmail ?? false;
  const phone = getProfilePhone(profile);
  const email = getProfileEmail(profile);
  const income = annualIncomeFormat(profile.education.annualIncomeAmount ?? '');
  const preferenceFilters = getPreferenceFilters(profile);
  const childrenRows: PdfRow[] = hasChildren(profile)
    ? [['Children', getChildrenSummary(profile)]]
    : [];
  const disabilityRows: PdfRow[] = hasDisability(profile)
    ? [
        ['Disability', 'Yes'],
        ['Disability Note', toDisplayText(profile.physical.disabilityNote)],
      ]
    : [];

  return [
    {
      title: 'Personal Details',
      rows: [
        [
          'Profile For',
          formatEnumLabel(
            t,
            'options.profile_for',
            profile.profileFor,
            EMPTY_VALUE
          ),
        ],
        [
          'Date of Birth',
          showExactAge
            ? toDisplayText(profile.personal.dateOfBirth)
            : MASKED_VALUE,
          !showExactAge,
        ],
        [
          'Gender',
          formatEnumLabel(
            t,
            'options.gender',
            profile.personal.gender,
            EMPTY_VALUE
          ),
        ],
        [
          'Marital Status',
          formatEnumLabel(
            t,
            'options.marital_status',
            profile.personal.maritalStatus,
            EMPTY_VALUE
          ),
        ],
        [
          'Religion',
          formatEnumLabel(
            t,
            'options.religion',
            profile.personal.religion,
            EMPTY_VALUE
          ),
        ],
        [
          'Caste',
          formatEnumLabel(
            t,
            'options.caste',
            profile.personal.religiousDetails?.caste,
            EMPTY_VALUE
          ),
        ],
        ['Mother Tongue', formatProfileText(profile.personal.motherTongue)],
        ...childrenRows,
        ['Citizenship', formatProfileText(profile.personal.citizenship)],
        [
          'NRI Profile',
          profile.personal.isNri
            ? 'Yes'
            : profile.personal.isNri === false
              ? 'No'
              : EMPTY_VALUE,
        ],
        [
          'Residency Country',
          formatEnumLabel(
            t,
            'options.countries',
            profile.personal.residencyCountry,
            EMPTY_VALUE
          ),
        ],
        ['Visa Status', formatProfileText(profile.personal.visaStatus)],
        ['Abroad Since', formatProfileText(profile.personal.abroadSince)],
        [
          'Willing to Relocate',
          profile.personal.willingToRelocate === undefined
            ? EMPTY_VALUE
            : profile.personal.willingToRelocate
              ? 'Yes'
              : 'No',
        ],
      ],
    },
    {
      title: 'Contact Visibility',
      rows: [
        [
          'Phone',
          showPhone ? phone : maskPhone(phone),
          !showPhone && phone !== EMPTY_VALUE,
        ],
        [
          'Email',
          showEmail ? email : maskEmail(email),
          !showEmail && email !== EMPTY_VALUE,
        ],
      ],
    },
    {
      title: 'Education & Career',
      rows: [
        [
          'Education',
          formatEnumLabel(
            t,
            'options.qualifications',
            profile.education.qualification,
            EMPTY_VALUE
          ),
        ],
        ['Field of Study', formatProfileText(profile.education.field)],
        ['College', formatProfileText(profile.education.university)],
        [
          'Occupation Type',
          formatEnumLabel(
            t,
            'options.occupation_types',
            profile.education.occupationType,
            EMPTY_VALUE
          ),
        ],
        ['Profession', formatProfileText(profile.education.occupation)],
        ['Company', formatProfileText(profile.education.companyName)],
        ['Job Role', formatProfileText(profile.education.jobRole)],
        ['Annual Income', showIncome ? income : MASKED_VALUE, !showIncome],
      ],
    },
    {
      title: 'Lifestyle & Physical',
      rows: [
        ['Weight', getFormattedWeight(profile.physical.weight)],
        [
          'Blood Group',
          formatEnumLabel(
            t,
            'options.blood_groups',
            profile.physical.bloodGroup,
            EMPTY_VALUE
          ),
        ],
        [
          'Body Type',
          formatEnumLabel(
            t,
            'options.body_types',
            profile.physical.bodyType,
            EMPTY_VALUE
          ),
        ],
        [
          'Complexion',
          formatEnumLabel(
            t,
            'options.complexion',
            profile.physical.complexion,
            EMPTY_VALUE
          ),
        ],
        ...disabilityRows,
        [
          'Smoking',
          formatEnumLabel(
            t,
            'options.smoking',
            profile.personal.smoking,
            EMPTY_VALUE
          ),
        ],
        [
          'Drinking',
          formatEnumLabel(
            t,
            'options.drinking',
            profile.personal.drinking,
            EMPTY_VALUE
          ),
        ],
        [
          'Eating',
          formatEnumLabel(
            t,
            'options.eating',
            profile.personal.eating,
            EMPTY_VALUE
          ),
        ],
        [
          'Personality',
          formatList(
            profile.personal.personalityBadges?.map((badge) =>
              formatEnumLabel(
                t,
                'options.personality_badges',
                badge,
                formatCamelCase(badge)
              )
            )
          ),
        ],
      ],
    },
    {
      title: 'Astro & Family',
      rows: [
        [
          'Manglik Status',
          formatEnumLabel(
            t,
            'options.manglik_status',
            profile.personal.religiousDetails?.manglikStatus,
            EMPTY_VALUE
          ),
        ],
        ['Time of Birth', getTimeOfBirth(profile)],
        ['Place of Birth', getPlaceOfBirth(profile)],
        ['Father', formatProfileText(profile.family?.fatherName)],
        ['Mother', formatProfileText(profile.family?.motherName)],
        [
          'Father Occupation',
          formatProfileText(profile.family?.fatherOccupation),
        ],
        [
          'Mother Occupation',
          formatProfileText(profile.family?.motherOccupation),
        ],
        [
          'Family Type',
          formatEnumLabel(
            t,
            'options.family_types',
            profile.family?.familyType,
            EMPTY_VALUE
          ),
        ],
        [
          'Family Status',
          formatEnumLabel(
            t,
            'options.family_status',
            profile.family?.familyStatus,
            EMPTY_VALUE
          ),
        ],
        [
          'Family Values',
          formatEnumLabel(
            t,
            'options.family_values',
            profile.family?.familyValues,
            EMPTY_VALUE
          ),
        ],
        ['Siblings', getSiblingCounts(profile, t)],
        ['Sibling Details', getSiblingDetailsSummary(profile, t)],
        ['Family Notes', formatProfileText(profile.family?.siblings?.note)],
      ],
    },
    {
      title: 'Partner Preferences',
      rows: [
        [
          'Preferred Age',
          formatNumberRange(
            preferenceFilters?.ageRange ?? preferenceFilters?.age,
            ' yrs'
          ),
        ],
        [
          'Preferred Height',
          formatHeightPreference(
            preferenceFilters?.heightRange ?? preferenceFilters?.height
          ),
        ],
        [
          'Preferred Marital Status',
          formatEnumList(
            t,
            'options.marital_status',
            preferenceFilters?.maritalStatus
          ),
        ],
        [
          'Preferred Religion',
          formatEnumList(t, 'options.religion', preferenceFilters?.religion),
        ],
        [
          'Preferred Caste',
          formatEnumList(t, 'options.caste', preferenceFilters?.caste),
        ],
        [
          'Preferred Manglik Status',
          formatEnumList(
            t,
            'options.manglik_status',
            preferenceFilters?.manglikStatus
          ),
        ],
        [
          'Preferred Location',
          [
            formatEnumList(t, 'options.countries', preferenceFilters?.country),
            formatList(preferenceFilters?.state),
            formatList(preferenceFilters?.city),
          ]
            .filter((value) => value !== EMPTY_VALUE)
            .join(', ') || EMPTY_VALUE,
        ],
        [
          'Preferred Education',
          formatEnumList(
            t,
            'options.qualifications',
            preferenceFilters?.qualification
          ),
        ],
        [
          'Preferred Occupation Type',
          formatEnumList(
            t,
            'options.occupation_types',
            preferenceFilters?.occupationType
          ),
        ],
        ['Preferred Occupation', formatList(preferenceFilters?.occupation)],
        [
          'Preferred Annual Income',
          formatIncomePreference(
            preferenceFilters?.annualIncomeRange ??
              preferenceFilters?.annualIncome
          ),
        ],
        [
          'Preferred Lifestyle',
          [
            formatEnumList(t, 'options.smoking', preferenceFilters?.smoking),
            formatEnumList(t, 'options.drinking', preferenceFilters?.drinking),
            formatEnumList(t, 'options.eating', preferenceFilters?.eating),
          ]
            .filter((value) => value !== EMPTY_VALUE)
            .join(', ') || EMPTY_VALUE,
        ],
        [
          'Preferred Languages',
          formatList(
            preferenceFilters?.languages ?? profile.preferences?.languagesKnown
          ),
        ],
        [
          'Preferred Child Preference',
          formatEnumLabel(
            t,
            'options.child_preferences',
            preferenceFilters?.childPreference,
            EMPTY_VALUE
          ),
        ],
        [
          'Preferred Residency Preference',
          formatEnumLabel(
            t,
            'options.residency_preferences',
            preferenceFilters?.residencyPreference,
            EMPTY_VALUE
          ),
        ],
      ],
    },
    {
      title: 'Interests',
      rows: [
        ['Hobbies', formatList(profile.personal.hobbies)],
        [
          'Languages Known',
          formatList(
            profile.personal.languages ?? profile.personal.languagesKnown
          ),
        ],
        [
          'About Partner',
          formatAboutMe(profile.preferences?.aboutPartner ?? ''),
        ],
      ],
    },
  ];
};

const createProfilePdfHtml = (
  profile: SchemaProfile,
  photoUrl: string | undefined,
  profileSummary: string,
  privacy: PrivacySettings | undefined,
  t: Translate
): string => {
  const age =
    toDisplayText(profile.age) !== EMPTY_VALUE
      ? `${profile.age} years`
      : getFormattedAge(profile.personal.dateOfBirth ?? '');
  const highlights = [
    age,
    getFormattedHeight(profile.physical.height),
    formatEnumLabel(
      t,
      'options.religion',
      profile.personal.religion,
      EMPTY_VALUE
    ),
  ].filter((value) => value !== EMPTY_VALUE);
  const sections = getPdfSections(profile, privacy, t)
    .map((section) => {
      const rows = section.rows
        .filter(([, value]) => value !== EMPTY_VALUE)
        .map(
          ([label, value, masked]) => `
            <tr>
              <th>${escapeHtml(label)}</th>
              <td class="${masked ? 'masked' : ''}">${escapeHtml(value || EMPTY_VALUE)}</td>
            </tr>`
        )
        .join('');

      if (!rows) return '';

      return `
        <section class="section-block">
          <h2>${escapeHtml(section.title)}</h2>
          <table>${rows}</table>
        </section>`;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size:A4; margin:14mm; }
          * { box-sizing: border-box; }
          body { margin:0; color:#332522; font-family:Georgia,"Times New Roman",serif; background:#fff; }
          .page { position:relative; background:#fffdf9; border:2px solid #8f2437; outline:1px solid #d7b46a; outline-offset:-7px; overflow:hidden; min-height:260mm; }
          .page:before,.page:after { content:"◆"; position:absolute; z-index:2; color:#c79a45; font-size:17px; }
          .page:before { top:11px; left:15px; } .page:after { right:15px; bottom:11px; }
          .document-watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; opacity:.025; transform:rotate(-28deg); font-size:68px; font-weight:800; letter-spacing:8px; color:#8f2437; text-transform:uppercase; }
          .document-title { padding:18px 24px 10px; text-align:center; color:#8f2437; font-size:13px; font-weight:700; letter-spacing:3px; text-transform:uppercase; }
          .title-rule { width:120px; height:2px; margin:0 auto 14px; background:linear-gradient(90deg,transparent,#c79a45,transparent); }
          .hero { display:flex; gap:24px; margin:0 18px; padding:22px; background:#fff8ed; border:1px solid #ead6af; }
          .photo-wrap { position:relative; width:148px; height:188px; border:5px solid #fff; outline:1px solid #c79a45; overflow:hidden; background:#eee7df; flex:0 0 auto; }
          .photo { width:150px; height:188px; object-fit:cover; background:#e5e7eb; display:block; }
          .photo-watermark { position:absolute; left:-18px; right:-18px; bottom:18px; transform:rotate(-22deg); background:rgba(76,28,37,.68); color:#fff; text-align:center; font:700 11px Arial,sans-serif; letter-spacing:2px; padding:6px 0; text-transform:uppercase; }
          .identity { flex:1; padding-top:5px; }
          h1 { margin:0 0 7px; color:#6f1d2c; font-size:29px; line-height:1.2; }
          .summary,.location { margin:0 0 8px; color:#6b554f; font-size:13px; }
          .highlights { display:flex; flex-wrap:wrap; gap:7px; margin:13px 0 4px; }
          .highlight { border:1px solid #d8ba7a; background:#fff; color:#6f1d2c; padding:5px 9px; font:700 11px Arial,sans-serif; }
          .privacy-note { margin-top:13px; padding:8px 10px; background:#fffdf9; border-left:3px solid #c79a45; color:#755f56; font:11px/1.45 Arial,sans-serif; }
          .section { padding:20px 22px 14px; }
          .section-grid { columns:2; column-gap:22px; }
          .section-block { break-inside:avoid; margin:0 0 18px; display:inline-block; width:100%; }
          h2 { margin:0 0 8px; padding-bottom:5px; border-bottom:1px solid #d7b46a; color:#8f2437; font-size:13px; text-transform:uppercase; letter-spacing:.8px; }
          .about-card { break-inside:avoid; margin-bottom:18px; padding:12px 14px; background:#fffaf2; border-left:3px solid #8f2437; }
          .about { margin:0; color:#4b3a35; font-size:12px; line-height:1.65; }
          table { width:100%; border-collapse:collapse; }
          th,td { padding:6px 0; border-bottom:1px dotted #ded0c5; vertical-align:top; font:11px/1.35 Arial,sans-serif; }
          th { width:42%; color:#806d65; font-weight:600; text-align:left; }
          td { color:#332522; text-align:right; font-weight:600; }
          td.masked { color:#a1938d; letter-spacing:1px; }
          .footer { margin:0 18px 12px; padding:12px 18px; border-top:1px solid #ead6af; color:#8c7c74; font:10px/1.4 Arial,sans-serif; text-align:center; }
        </style>
      </head>
      <body>
        <main class="page">
          <div class="document-watermark">Match Mate</div>
          <div class="document-title">${escapeHtml(
            t('profile.pdf_document_title', {
              defaultValue: 'Matrimonial Biodata',
            })
          )}</div>
          <div class="title-rule"></div>
          <section class="hero">
            <div class="photo-wrap">
              ${photoUrl ? `<img class="photo" src="${escapeHtml(photoUrl)}" />` : '<div class="photo"></div>'}
              <div class="photo-watermark">Match Mate</div>
            </div>
            <div class="identity">
              <h1>${escapeHtml(getDisplayName(profile))}</h1>
              <p class="summary">${escapeHtml(profileSummary)}</p>
              <p class="location">${escapeHtml(getLocation(profile))}</p>
              <div class="highlights">${highlights
                .map(
                  (value) =>
                    `<span class="highlight">${escapeHtml(value)}</span>`
                )
                .join('')}</div>
              <div class="privacy-note">${escapeHtml(
                t('profile.pdf_privacy_note', {
                  defaultValue:
                    'Sensitive fields are masked according to your current privacy settings.',
                })
              )}</div>
            </div>
          </section>
          <section class="section">
            <div class="about-card">
              <h2>${escapeHtml(
                t('profile.pdf_about_title', {
                  defaultValue: 'About',
                })
              )}</h2>
              <p class="about">${escapeHtml(formatAboutMe(profile.personal.aboutMe))}</p>
            </div>
            <div class="section-grid">${sections}</div>
          </section>
          <div class="footer">${escapeHtml(
            t('profile.pdf_footer', {
              defaultValue:
                'Generated from Match Mate. Shared profile copy is watermarked and privacy-safe.',
            })
          )}</div>
        </main>
      </body>
    </html>`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfilePhoto({
  uri,
  index,
  width,
}: {
  uri: string;
  index: number;
  width: number;
}): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { t } = useTranslation();
  const { imageResizeMethod } = useMediaSettings();
  const [hasError, setHasError] = useState(false);

  // resolveApiUrl returns absolute URLs from the media API.
  // On error we fall back to the local placeholder asset.
  const source = hasError ? FALLBACK_PHOTO : uri;

  return (
    <Image
      source={typeof source === 'string' ? { uri: source } : source}
      style={[styles.photo, { width }]}
      resizeMode="cover"
      resizeMethod={imageResizeMethod}
      accessibilityLabel={t('profile.photo_label', { number: index + 1 })}
      onError={() => setHasError(true)}
    />
  );
}

function VerificationBadge({
  labelKey,
  verified,
}: {
  labelKey: string;
  verified: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.verificationBadge,
        verified
          ? styles.verificationBadgeVerified
          : styles.verificationBadgeUnverified,
      ]}
    >
      <Feather
        name={verified ? 'check-circle' : 'alert-circle'}
        size={13}
        color={verified ? theme.colors.success : theme.colors.primary}
      />
      <Text
        style={[
          styles.verificationBadgeText,
          verified
            ? styles.verificationBadgeTextVerified
            : styles.verificationBadgeTextUnverified,
        ]}
      >
        {t(labelKey)}
      </Text>
    </View>
  );
}

function SiblingList({
  items,
}: {
  items: SiblingDisplayItem[];
}): React.ReactElement {
  const styles = useThemedStyles(profileStyles);

  if (items.length === 0) {
    return <Text style={styles.tagEmptyText}>{EMPTY_VALUE}</Text>;
  }

  return (
    <View style={styles.siblingList}>
      {items.map((item, index) => (
        <View key={`${item.type}-${index}`} style={styles.siblingItem}>
          <View style={styles.siblingIndex}>
            <Text style={styles.siblingIndexText}>{index + 1}</Text>
          </View>
          <View style={styles.siblingContent}>
            <Text style={styles.siblingTitle}>{item.type}</Text>
            <Text style={styles.siblingMeta}>
              {[item.maritalStatus, item.occupation]
                .filter((v) => v !== EMPTY_VALUE)
                .join(' · ') || EMPTY_VALUE}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen({
  navigation,
}: ProfileScreenProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const showUpgradePrompt = useUpgradePrompt();
  const { width } = useWindowDimensions();
  const photoWidth = getResponsiveMediaWidth(width);
  const { hasFeature: canUploadVideos } = usePlanFeatureAccess(
    UPLOAD_VIDEOS_FEATURE
  );

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [pdfAction, setPdfAction] = useState<PdfAction | null>(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetMyProfileQuery();
  const { data: privacyResponse } = useGetPrivacySettingsQuery();

  const profileData = useMemo<SchemaProfile>(
    () =>
      data?.success ? (data.data as unknown as SchemaProfile) : DEFAULT_PROFILE,
    [data]
  );

  const profileVerified = profileData.verification?.status === 'approved';

  const hobbies = useMemo(
    () => toStringList(profileData.personal.hobbies),
    [profileData.personal.hobbies]
  );

  const personalityBadges = useMemo(
    () =>
      toStringList(profileData.personal.personalityBadges).map((badge) => ({
        label: getPersonalityBadgeLabel(badge, t),
        icon: getPersonalityBadgeIcon(badge),
      })),
    [profileData.personal.personalityBadges, t]
  );

  const languagesKnown = useMemo(
    () =>
      toStringList(
        profileData.personal.languages ?? profileData.personal.languagesKnown
      ),
    [profileData.personal.languages, profileData.personal.languagesKnown]
  );

  const siblingDetails = useMemo(
    () => getSiblingDetails(profileData, t),
    [profileData, t]
  );

  const photos = useMemo(
    () => getProfilePhotos(profileData.images),
    [profileData.images]
  );

  const printablePhoto = useMemo(
    () => getPrintableProfilePhoto(profileData.images),
    [profileData.images]
  );

  const videoIntro = useMemo(() => {
    if (!canUploadVideos) return null;

    const video = profileData.videoIntro;
    if (!video?.url) return null;
    return {
      ...video,
      url: resolveApiUrl(video.url) ?? video.url,
      thumbnailUrl: video.thumbnailUrl
        ? (resolveApiUrl(video.thumbnailUrl) ?? video.thumbnailUrl)
        : undefined,
    };
  }, [canUploadVideos, profileData.videoIntro]);

  const profileSummary = useMemo(
    () =>
      [
        getFormattedAge(profileData.personal.dateOfBirth ?? ''),
        getFormattedHeight(profileData.physical.height),
        formatEnumLabel(
          t,
          'options.marital_status',
          profileData.personal.maritalStatus,
          EMPTY_VALUE
        ),
      ]
        .filter((v) => v !== EMPTY_VALUE)
        .join(' · ') || EMPTY_VALUE,
    [profileData, t]
  );

  const enumLabel = useCallback(
    (prefix: string, value: Primitive): string =>
      formatEnumLabel(
        t,
        prefix,
        value as string | number | null | undefined,
        EMPTY_VALUE
      ),
    [t]
  );

  const fetchProfile = useCallback((): void => {
    void refetch();
  }, [refetch]);

  // ─── Scroll handler ───────────────────────────────────────────────────────

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const index = Math.round(e.nativeEvent.contentOffset.x / photoWidth);
      setActivePhotoIndex(Math.min(index, photos.length - 1));
    },
    [photoWidth, photos.length]
  );

  // ─── PDF ─────────────────────────────────────────────────────────────────

  const handleProfilePdf = useCallback(
    async (action: PdfAction): Promise<void> => {
      if (pdfAction !== null) return;

      setPdfAction(action);

      try {
        const buildPdf = async (
          photoUrl: string | undefined
        ): Promise<string> => {
          const html = createProfilePdfHtml(
            profileData,
            photoUrl,
            profileSummary,
            privacyResponse?.privacy,
            t
          );
          const { uri } = await Print.printToFileAsync({ html, base64: false });
          return uri;
        };

        let uri: string;
        const pdfPhoto = canEmbedPhotoInPdf(privacyResponse?.privacy)
          ? printablePhoto
          : undefined;
        if (Platform.OS === 'web') {
          try {
            const webHtml = createProfilePdfHtml(
              profileData,
              pdfPhoto,
              profileSummary,
              privacyResponse?.privacy,
              t
            );
            await printProfilePdfOnWeb(webHtml);
          } catch {
            const webHtml = createProfilePdfHtml(
              profileData,
              undefined,
              profileSummary,
              privacyResponse?.privacy,
              t
            );
            await printProfilePdfOnWeb(webHtml);
          }
          return;
        }

        try {
          uri = await buildPdf(pdfPhoto);
        } catch {
          // Photo embed failed — retry without image
          if (__DEV__) {
            console.warn(
              '[ProfileScreen] PDF with photo failed, retrying without'
            );
          }
          uri = await buildPdf(undefined);
        }

        const pdfUri = await copyPdfToDocumentDirectory(uri, profileData);

        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          showError({
            title: t('profile.sharing_unavailable_title'),
            message: t('profile.sharing_unavailable_message', { uri: pdfUri }),
          });
          return;
        }

        await Sharing.shareAsync(pdfUri, {
          dialogTitle: t(
            action === 'download'
              ? 'profile.pdf_save_dialog'
              : 'profile.pdf_share_dialog'
          ),
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
        });
      } catch {
        showError({
          title: t('profile.pdf_failed_title'),
          message: t('profile.pdf_failed_message'),
        });
      } finally {
        setPdfAction(null);
      }
    },
    [
      pdfAction,
      printablePhoto,
      privacyResponse?.privacy,
      profileData,
      profileSummary,
      t,
    ]
  );

  const renderPhoto: ListRenderItem<string> = useCallback(
    ({ item, index }) => (
      <ProfilePhoto uri={item} index={index} width={photoWidth} />
    ),
    [photoWidth]
  );

  // ─── Error state ──────────────────────────────────────────────────────────

  if (!isLoading && (isError || data?.success === false)) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
        edges={['top', 'left', 'right']}
      >
        <Feather name="alert-circle" size={48} color={theme.colors.danger} />
        <Text style={styles.errorTitle}>{t('common.error_title')}</Text>
        <Text style={styles.errorSubtitle}>
          {data?.success === false
            ? data.message
            : t('profile.load_error_message')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProfile}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>
            {isFetching ? t('common.retrying') : t('common.try_again')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Header
          title={t('profile.title')}
          actions={[
            {
              icon: 'settings',
              onPress: () => navigation.navigate('Settings'),
            },
          ]}
        />
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header
        title={t('profile.title')}
        actions={[
          { icon: 'settings', onPress: () => navigation.navigate('Settings') },
        ]}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photo carousel */}
        <View>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderPhoto}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: photoWidth,
              offset: photoWidth * index,
              index,
            })}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
          />
          {photos.length > 1 && (
            <View style={styles.dotRow}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activePhotoIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Name & basic */}
        <View style={styles.nameCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{getDisplayName(profileData)}</Text>
            <VerificationBadge
              labelKey={
                profileVerified
                  ? 'profile.badge_verified'
                  : 'profile.badge_unverified'
              }
              verified={profileVerified}
            />
          </View>
          <Text style={styles.subText}>{profileSummary}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={theme.colors.textMuted} />
            <Text style={styles.locationText}>{getLocation(profileData)}</Text>
          </View>
          <View style={styles.profileMetaGrid}>
            <View style={styles.profileMetaItem}>
              <Text style={styles.profileMetaValue}>
                {toDisplayText(profileData.profileCompletionPercentage)}%
              </Text>
              <Text style={styles.profileMetaLabel}>
                {t('profile.meta_complete')}
              </Text>
            </View>
            <View style={styles.profileMetaItem}>
              <Text style={styles.profileMetaValue}>
                {toDisplayText(profileData.profileScore)}
              </Text>
              <Text style={styles.profileMetaLabel}>
                {t('profile.meta_score')}
              </Text>
            </View>
            <View style={styles.profileMetaItem}>
              <Text style={styles.profileMetaValue}>
                {toDisplayText(profileData.visibilityScore)}
              </Text>
              <Text style={styles.profileMetaLabel}>
                {t('profile.meta_visibility')}
              </Text>
            </View>
            <View style={styles.profileMetaItem}>
              <Text style={styles.profileMetaValue}>
                {formatEnumLabel(
                  t,
                  'options.profile_status',
                  profileData.status,
                  formatCamelCase(profileData.status ?? '')
                )}
              </Text>
              <Text style={styles.profileMetaLabel}>
                {t('profile.meta_status')}
              </Text>
            </View>
          </View>
        </View>

        <Section titleKey="profile.section_about" icon="user">
          <Text style={styles.aboutText}>
            {formatAboutMe(profileData.personal.aboutMe)}
          </Text>
        </Section>

        <Section titleKey="profile.section_overview" icon="award">
          <Row
            labelKey="profile.row_profile_for"
            value={enumLabel('options.profile_for', profileData.profileFor)}
          />
          <Row
            labelKey="profile.row_gender"
            value={enumLabel('options.gender', profileData.personal.gender)}
          />
          <Row
            labelKey="profile.row_city"
            value={formatProfileText(profileData.personal.city)}
          />
          <Row
            labelKey="profile.row_premium"
            value={toDisplayText(profileData.isPremium)}
          />
          <Row
            labelKey="profile.row_last_active"
            value={formatDateTime(profileData.lastActiveAt)}
          />
        </Section>

        <Section titleKey="profile.section_contact" icon="phone">
          <Row
            labelKey="profile.row_phone"
            value={getProfilePhone(profileData)}
          />
          <Row
            labelKey="profile.row_email"
            value={getProfileEmail(profileData)}
          />
        </Section>

        <Section titleKey="profile.section_personal" icon="user-check">
          <Row
            labelKey="profile.row_dob"
            value={toDisplayText(profileData.personal.dateOfBirth)}
          />
          <Row
            labelKey="profile.row_time_of_birth"
            value={getTimeOfBirth(profileData)}
          />
          <Row
            labelKey="profile.row_place_of_birth"
            value={getPlaceOfBirth(profileData)}
          />
          <Row
            labelKey="profile.row_marital_status"
            value={enumLabel(
              'options.marital_status',
              profileData.personal.maritalStatus
            )}
          />
          {hasChildren(profileData) && (
            <Row
              labelKey="profile.row_children"
              value={getChildrenSummary(profileData)}
            />
          )}
          <Row
            labelKey="profile.row_relocate"
            value={toDisplayText(profileData.personal.willingToRelocate)}
          />
          <Row
            labelKey="profile.row_citizenship"
            value={formatProfileText(profileData.personal.citizenship)}
          />
          <Row
            labelKey="profile.row_nri"
            value={toDisplayText(profileData.personal.isNri)}
          />
          {profileData.personal.isNri ? (
            <>
              <Row
                labelKey="profile.row_residency_country"
                value={enumLabel(
                  'options.countries',
                  profileData.personal.residencyCountry
                )}
              />
              <Row
                labelKey="profile.row_visa_status"
                value={formatProfileText(profileData.personal.visaStatus)}
              />
              <Row
                labelKey="profile.row_abroad_since"
                value={formatProfileText(profileData.personal.abroadSince)}
              />
            </>
          ) : null}
        </Section>

        <Section titleKey="profile.section_astro" icon="sun">
          <Row
            labelKey="profile.row_religion"
            value={enumLabel('options.religion', profileData.personal.religion)}
          />
          <Row
            labelKey="profile.row_caste"
            value={enumLabel(
              'options.caste',
              profileData.personal.religiousDetails?.caste
            )}
          />
          <Row
            labelKey="profile.row_sub_caste"
            value={formatProfileText(
              profileData.personal.religiousDetails?.subCaste
            )}
          />
          <Row
            labelKey="profile.row_gotra"
            value={formatProfileText(
              profileData.personal.religiousDetails?.gotra
            )}
          />
          <Row
            labelKey="profile.row_mother_tongue"
            value={formatProfileText(profileData.personal.motherTongue)}
          />
          <Row
            labelKey="profile.row_manglik"
            value={enumLabel(
              'options.manglik_status',
              profileData.personal.religiousDetails?.manglikStatus
            )}
          />
          <Row
            labelKey="profile.row_rashi"
            value={formatProfileText(
              profileData.personal.religiousDetails?.rashi
            )}
          />
          <Row
            labelKey="profile.row_nakshatra"
            value={formatProfileText(
              profileData.personal.religiousDetails?.nakshatra
            )}
          />
          <Row
            labelKey="profile.row_kundli"
            value={toDisplayText(
              profileData.personal.religiousDetails?.kundliFileUrl
            )}
          />
        </Section>

        <Section titleKey="profile.section_education" icon="book">
          <Row
            labelKey="profile.row_education"
            value={enumLabel(
              'options.qualifications',
              profileData.education.qualification
            )}
          />
          <Row
            labelKey="profile.row_field"
            value={formatProfileText(profileData.education.field)}
          />
          <Row
            labelKey="profile.row_college"
            value={formatProfileText(profileData.education.university)}
          />
          <Row
            labelKey="profile.row_occupation_type"
            value={enumLabel(
              'options.occupation_types',
              profileData.education.occupationType
            )}
          />
          <Row
            labelKey="profile.row_profession"
            value={formatProfileText(profileData.education.occupation)}
          />
          <Row
            labelKey="profile.row_company"
            value={formatProfileText(profileData.education.companyName)}
          />
          <Row
            labelKey="profile.row_job_role"
            value={formatProfileText(profileData.education.jobRole)}
          />
          <Row
            labelKey="profile.row_income"
            value={annualIncomeFormat(
              profileData.education.annualIncomeAmount ?? ''
            )}
          />
        </Section>

        <Section titleKey="profile.section_physical" icon="activity">
          <Row
            labelKey="profile.row_height"
            value={getFormattedHeight(profileData.physical.height)}
          />
          <Row
            labelKey="profile.row_weight"
            value={getFormattedWeight(profileData.physical.weight)}
          />
          <Row
            labelKey="profile.row_blood_group"
            value={enumLabel(
              'options.blood_groups',
              profileData.physical.bloodGroup
            )}
          />
          <Row
            labelKey="profile.row_body_type"
            value={enumLabel(
              'options.body_types',
              profileData.physical.bodyType
            )}
          />
          <Row
            labelKey="profile.row_complexion"
            value={enumLabel(
              'options.complexion',
              profileData.physical.complexion
            )}
          />
          {hasDisability(profileData) && (
            <>
              <Row labelKey="profile.row_disability" value="Yes" />
              <Row
                labelKey="profile.row_disability_note"
                value={toDisplayText(profileData.physical.disabilityNote)}
              />
            </>
          )}
        </Section>

        <Section titleKey="profile.section_lifestyle" icon="coffee">
          <Row
            labelKey="profile.row_smoking"
            value={enumLabel('options.smoking', profileData.personal.smoking)}
          />
          <Row
            labelKey="profile.row_drinking"
            value={enumLabel('options.drinking', profileData.personal.drinking)}
          />
          <Row
            labelKey="profile.row_eating"
            value={enumLabel('options.eating', profileData.personal.eating)}
          />
        </Section>

        <Section titleKey="profile.section_family" icon="home">
          <Row
            labelKey="profile.row_father"
            value={formatProfileText(profileData.family?.fatherName)}
          />
          <Row
            labelKey="profile.row_mother"
            value={formatProfileText(profileData.family?.motherName)}
          />
          <Row
            labelKey="profile.row_father_occupation"
            value={formatProfileText(profileData.family?.fatherOccupation)}
          />
          <Row
            labelKey="profile.row_mother_occupation"
            value={formatProfileText(profileData.family?.motherOccupation)}
          />
          <Row
            labelKey="profile.row_family_type"
            value={enumLabel(
              'options.family_types',
              profileData.family?.familyType
            )}
          />
          <Row
            labelKey="profile.row_family_status"
            value={enumLabel(
              'options.family_status',
              profileData.family?.familyStatus
            )}
          />
          <Row
            labelKey="profile.row_family_values"
            value={enumLabel(
              'options.family_values',
              profileData.family?.familyValues
            )}
          />
          <Row
            labelKey="profile.row_siblings"
            value={getSiblingCounts(profileData, t)}
          />
          <Row
            labelKey="profile.row_sibling_note"
            value={toDisplayText(profileData.family?.siblings?.note)}
          />
          {siblingDetails.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>
                {t('profile.sibling_details_label')}
              </Text>
              <SiblingList items={siblingDetails} />
            </View>
          )}
        </Section>

        {(!canUploadVideos ? true : Boolean(videoIntro)) && (
          <Section titleKey="profile.section_video_intro" icon="video">
            {!canUploadVideos ? (
              <TouchableOpacity
                style={styles.videoIntroLocked}
                onPress={() =>
                  showUpgradePrompt(t('profile.section_video_intro'))
                }
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <View style={styles.videoIntroLockedIcon}>
                  <Feather name="lock" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.videoIntroLockedCopy}>
                  <Text style={styles.videoIntroTitle}>
                    {t('profile.video_intro_available')}
                  </Text>
                  <Text style={styles.videoIntroSubtitle}>
                    {t('profile.video_intro_upgrade', {
                      defaultValue:
                        'Upgrade your plan to add a video introduction.',
                    })}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            ) : videoIntro ? (
              <View style={styles.videoIntroCard}>
                <InlineVideoPlayer
                  videoUrl={videoIntro.url}
                  thumbnailUrl={videoIntro.thumbnailUrl}
                  placeholderText={t('profile.video_intro_available')}
                  previewStyle={styles.videoIntroPreview}
                  thumbnailStyle={styles.videoIntroThumbnail}
                  thumbnailImageStyle={styles.videoIntroThumbnailImage}
                  overlayStyle={styles.videoIntroOverlay}
                  placeholderStyle={styles.videoIntroPlaceholder}
                  playButtonStyle={styles.videoIntroPlayButton}
                  placeholderTextStyle={styles.videoIntroPlaceholderText}
                />
                <View style={styles.videoIntroContent}>
                  <View style={styles.videoIntroTitleRow}>
                    <Feather
                      name="video"
                      size={15}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.videoIntroTitle}>
                      {t('profile.video_intro_available')}
                    </Text>
                  </View>
                  <Text style={styles.videoIntroSubtitle}>
                    {t('profile.video_intro_watch')}
                  </Text>
                </View>
              </View>
            ) : null}
          </Section>
        )}

        <Section titleKey="profile.section_interests" icon="music">
          {personalityBadges.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>
                {t('profile.personality_label')}
              </Text>
              <TagList items={personalityBadges} />
            </View>
          )}
          {hobbies.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>
                {t('profile.hobbies_label')}
              </Text>
              <TagList items={hobbies} />
            </View>
          )}
          <View style={styles.tagSection}>
            <Text style={styles.tagSectionLabel}>
              {t('profile.languages_label')}
            </Text>
            <TagList items={languagesKnown} />
          </View>
        </Section>

        <View style={styles.footer} />
      </ScrollView>

      {/* PDF action bar */}
      <View style={styles.pdfActionBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('profile.download_pdf_label')}
          disabled={pdfAction !== null}
          onPress={() => {
            void handleProfilePdf('download');
          }}
          style={[
            styles.pdfActionButton,
            styles.pdfDownloadButton,
            pdfAction !== null && styles.pdfActionButtonDisabled,
          ]}
        >
          {pdfAction === 'download' ? (
            <ActivityIndicator color={theme.colors.white} size="small" />
          ) : (
            <Feather name="download" size={18} color={theme.colors.white} />
          )}
          <Text style={styles.pdfActionButtonText}>
            {pdfAction === 'download'
              ? t('profile.pdf_preparing')
              : t('profile.download_pdf')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('profile.share_pdf_label')}
          disabled={pdfAction !== null}
          onPress={() => {
            void handleProfilePdf('share');
          }}
          style={[
            styles.pdfActionButton,
            styles.pdfShareButton,
            pdfAction !== null && styles.pdfActionButtonDisabled,
          ]}
        >
          {pdfAction === 'share' ? (
            <ActivityIndicator color={theme.colors.white} size="small" />
          ) : (
            <Feather name="share-2" size={18} color={theme.colors.white} />
          )}
          <Text style={styles.pdfActionButtonText}>
            {pdfAction === 'share'
              ? t('profile.pdf_preparing')
              : t('profile.share_pdf')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
