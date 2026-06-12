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

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_VALUE = '—';

// ─── Default profile ──────────────────────────────────────────────────────────

const DEFAULT_PROFILE: SchemaProfile = {
  profileFor: 'self',
  personal: {
    firstName: '',
    lastName: '',
    gender: Genders.MALE,
    dateOfBirth: '',
    religion: Religions.HINDU,
    caste: '',
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

const toDisplayText = (value: Primitive): string => {
  if (value === undefined || value === null) return EMPTY_VALUE;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const text = String(value).trim();
  return text.length > 0 ? text : EMPTY_VALUE;
};

const formatProfileText = (value: Primitive): string => {
  const text = toDisplayText(value);
  return text === EMPTY_VALUE ? EMPTY_VALUE : formatCamelCase(text);
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

const getSiblingCounts = (profile: SchemaProfile): string => {
  const s = profile.family?.siblings;
  if (!s) return EMPTY_VALUE;
  const brothers = s.brothersCount ?? s.brothers ?? 0;
  const sisters = s.sistersCount ?? s.sisters ?? 0;
  const mb = s.marriedBrothersCount ?? s.marriedBrothers ?? 0;
  const ms = s.marriedSistersCount ?? s.marriedSisters ?? 0;
  return [
    `${brothers} brother${brothers === 1 ? '' : 's'}`,
    `${sisters} sister${sisters === 1 ? '' : 's'}`,
    `${mb} married brother${mb === 1 ? '' : 's'}`,
    `${ms} married sister${ms === 1 ? '' : 's'}`,
  ].join(', ');
};

const getSiblingDetails = (profile: SchemaProfile): SiblingDisplayItem[] =>
  profile.family?.siblings?.details?.map((s) => ({
    type: formatProfileText(s.type),
    maritalStatus: s.married ? 'Married' : 'Unmarried',
    occupation: formatProfileText(s.occupation),
  })) ?? [];

const toStringList = (items: unknown): string[] =>
  Array.isArray(items)
    ? items.filter((i): i is string => typeof i === 'string')
    : [];

const formatList = (items: unknown): string =>
  toStringList(items).filter(Boolean).join(', ') || EMPTY_VALUE;

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

const getPdfRows = (
  profile: SchemaProfile,
  t: (key: string, options: { defaultValue: string }) => string
): Array<[string, string]> => [
  ['Name', getDisplayName(profile)],
  [
    'Profile For',
    formatEnumLabel(t, 'options.profile_for', profile.profileFor, EMPTY_VALUE),
  ],
  [
    'Age',
    toDisplayText(profile.age) !== EMPTY_VALUE
      ? `${profile.age} yrs`
      : getFormattedAge(profile.personal.dateOfBirth ?? ''),
  ],
  ['Date of Birth', toDisplayText(profile.personal.dateOfBirth)],
  [
    'Gender',
    formatEnumLabel(t, 'options.gender', profile.personal.gender, EMPTY_VALUE),
  ],
  ['Height', getFormattedHeight(profile.physical.height)],
  ['Location', getLocation(profile)],
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
    formatEnumLabel(t, 'options.caste', profile.personal.caste, EMPTY_VALUE),
  ],
  ['Mother Tongue', formatProfileText(profile.personal.motherTongue)],
  [
    'Manglik Status',
    formatEnumLabel(
      t,
      'options.manglik_status',
      profile.personal.manglikStatus,
      EMPTY_VALUE
    ),
  ],
  ['Time of Birth', getTimeOfBirth(profile)],
  ['Place of Birth', getPlaceOfBirth(profile)],
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
  [
    'Annual Income',
    annualIncomeFormat(profile.education.annualIncomeAmount ?? ''),
  ],
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
  ['Disability', toDisplayText(profile.physical.disabilityStatus)],
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
    formatEnumLabel(t, 'options.eating', profile.personal.eating, EMPTY_VALUE),
  ],
  ['Father', formatProfileText(profile.family?.fatherName)],
  ['Mother', formatProfileText(profile.family?.motherName)],
  ['Father Occupation', formatProfileText(profile.family?.fatherOccupation)],
  ['Mother Occupation', formatProfileText(profile.family?.motherOccupation)],
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
  ['Siblings', getSiblingCounts(profile)],
  ['Hobbies', formatList(profile.personal.hobbies)],
  [
    'Languages Known',
    formatList(profile.personal.languages ?? profile.personal.languagesKnown),
  ],
];

const createProfilePdfHtml = (
  profile: SchemaProfile,
  photoUrl: string | undefined,
  profileSummary: string,
  t: (key: string, options: { defaultValue: string }) => string
): string => {
  const rows = getPdfRows(profile, t)
    .map(
      ([label, value]) => `
        <tr>
          <th>${escapeHtml(label)}</th>
          <td>${escapeHtml(value || EMPTY_VALUE)}</td>
        </tr>`
    )
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { margin:0; padding:32px; color:#1f2933; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#f6f8fb; }
          .page { background:#fff; border:1px solid #e5e9f0; border-radius:18px; overflow:hidden; }
          .hero { display:flex; gap:24px; padding:28px; background:#fff7f1; border-bottom:1px solid #efe3d7; }
          .photo { width:150px; height:188px; border-radius:14px; object-fit:cover; background:#e5e7eb; }
          h1 { margin:0 0 8px; font-size:30px; line-height:1.2; }
          .summary,.location { margin:0 0 8px; color:#667085; font-size:14px; }
          .section { padding:24px 28px; }
          h2 { margin:0 0 12px; color:#344054; font-size:15px; text-transform:uppercase; letter-spacing:.5px; }
          .about { margin:0 0 20px; color:#344054; font-size:14px; line-height:1.65; }
          table { width:100%; border-collapse:collapse; }
          th,td { padding:10px 0; border-bottom:1px solid #edf1f5; vertical-align:top; font-size:13px; }
          th { width:34%; color:#667085; font-weight:600; text-align:left; }
          td { color:#111827; text-align:right; font-weight:500; }
          .footer { padding:16px 28px; color:#98a2b3; font-size:11px; text-align:center; background:#fbfcfd; }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero">
            ${photoUrl ? `<img class="photo" src="${escapeHtml(photoUrl)}" />` : '<div class="photo"></div>'}
            <div>
              <h1>${escapeHtml(getDisplayName(profile))}</h1>
              <p class="summary">${escapeHtml(profileSummary)}</p>
              <p class="location">${escapeHtml(getLocation(profile))}</p>
            </div>
          </section>
          <section class="section">
            <h2>About</h2>
            <p class="about">${escapeHtml(formatAboutMe(profile.personal.aboutMe))}</p>
            <h2>Profile Details</h2>
            <table>${rows}</table>
          </section>
          <div class="footer">Generated from Match Mate</div>
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
  const [hasError, setHasError] = useState(false);

  // resolveApiUrl returns absolute URLs from the media API.
  // On error we fall back to the local placeholder asset.
  const source = hasError ? FALLBACK_PHOTO : uri;

  return (
    <Image
      source={typeof source === 'string' ? { uri: source } : source}
      style={[styles.photo, { width }]}
      resizeMode="cover"
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
  const { width } = useWindowDimensions();
  const photoWidth = getResponsiveMediaWidth(width);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [pdfAction, setPdfAction] = useState<PdfAction | null>(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetMyProfileQuery();

  const profileData = useMemo<SchemaProfile>(
    () =>
      data?.success ? (data.data as unknown as SchemaProfile) : DEFAULT_PROFILE,
    [data]
  );

  const profileVerified = Boolean(
    profileData.verification?.isProfileVerified ??
    profileData.verification?.isVerified ??
    profileData.isVerified
  );

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
    () => getSiblingDetails(profileData),
    [profileData]
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
    const video = profileData.videoIntro;
    if (!video?.url) return null;
    return {
      ...video,
      url: resolveApiUrl(video.url) ?? video.url,
      thumbnailUrl: video.thumbnailUrl
        ? (resolveApiUrl(video.thumbnailUrl) ?? video.thumbnailUrl)
        : undefined,
    };
  }, [profileData.videoIntro]);

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
            t
          );
          const { uri } = await Print.printToFileAsync({ html, base64: false });
          return uri;
        };

        let uri: string;
        try {
          uri = await buildPdf(printablePhoto);
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
    [pdfAction, printablePhoto, profileData, profileSummary, t]
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
      <SafeAreaView style={styles.centerContainer}>
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
      <SafeAreaView style={styles.safe}>
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
    <SafeAreaView style={styles.safe}>
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
                {formatProfileText(profileData.status)}
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
          <Row
            labelKey="profile.row_children"
            value={getChildrenSummary(profileData)}
          />
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
            value={enumLabel('options.caste', profileData.personal.caste)}
          />
          <Row
            labelKey="profile.row_sub_caste"
            value={formatProfileText(profileData.personal.subCast)}
          />
          <Row
            labelKey="profile.row_gotra"
            value={formatProfileText(profileData.personal.gotra)}
          />
          <Row
            labelKey="profile.row_mother_tongue"
            value={formatProfileText(profileData.personal.motherTongue)}
          />
          <Row
            labelKey="profile.row_manglik"
            value={enumLabel(
              'options.manglik_status',
              profileData.personal.manglikStatus
            )}
          />
          <Row
            labelKey="profile.row_rashi"
            value={formatProfileText(profileData.personal.rashi)}
          />
          <Row
            labelKey="profile.row_nakshatra"
            value={formatProfileText(profileData.personal.nakshatra)}
          />
          <Row
            labelKey="profile.row_kundli"
            value={toDisplayText(profileData.personal.kundliFileUrl)}
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
          <Row
            labelKey="profile.row_disability"
            value={toDisplayText(profileData.physical.disabilityStatus)}
          />
          <Row
            labelKey="profile.row_disability_note"
            value={toDisplayText(profileData.physical.disabilityNote)}
          />
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
            value={getSiblingCounts(profileData)}
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

        {videoIntro && (
          <Section titleKey="profile.section_video_intro" icon="video">
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
