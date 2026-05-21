import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  annualIncomeFormat,
  cmToFeetInches,
  formatAboutMe,
  formatCamelCase,
  formatLifestyleChoice,
  formatMaritalStatus,
  formatWeight,
  getAgeFromDOB,
  getFullName,
} from '../../core/utils/format';
import Header from '../../core/components/Header';
import { useGetMyProfileQuery } from '../../store/services/profileApi';
import {
  Countries,
  Genders,
  MaritalStatuses,
  Religions,
  SmokingHabits,
  DrinkingHabits,
  ProfileImage,
  Hour,
  Minute,
  Period,
  Country,
  ProfileFor,
  ManglikStatus,
  SmokingHabit,
  DrinkingHabit,
  EatingHabit,
  Gender,
  EatingHabits,
  MaritalStatus,
} from '../../core/types';
import { windowWidth } from '../../core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from './Profile.styles';
import { ProfileScreenProps } from './Profile.types';
import { FALLBACK_PHOTOS } from './Profile.constants';
import { ProfileSkeleton } from './components/ProfileSkeleton';
import { Section } from './components/Section';
import { Row } from './components/Row';
import { TagList } from './components/TagList';
import { showError } from '@/core/utils/toast';
import { useTheme } from '@/core/theme/ThemeProvider';

const EMPTY_VALUE = '—';
type PdfAction = 'download' | 'share';

type Primitive = string | number | boolean | null | undefined;

type SchemaProfile = {
  userId?: string;
  profileFor?: ProfileFor;
  personal: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    timeOfBirth?: {
      hour?: Hour;
      minute?: Minute;
      period?: Period;
    };
    placeOfBirth?: {
      city?: string;
      state?: string;
      country?: Country;
    };
    subCast?: string;
    gotra?: string;
    manglikStatus?: ManglikStatus;
    rashi?: string;
    nakshatra?: string;
    kundliFileUrl?: string;
    country?: Country;
    state?: string;
    city?: string;
    citizenship?: string;
    willingToRelocate?: boolean;
    motherTongue?: string;
    maritalStatus?: MaritalStatus;
    hasChildren?: boolean;
    sonsCount?: number;
    daughtersCount?: number;
    smoking?: SmokingHabit;
    drinking?: DrinkingHabit;
    eating?: EatingHabit;
    hobbies?: string[];
    languages?: string[];
    languagesKnown?: string[];
    aboutMe?: string;
    gender?: Gender;
  };
  physical: {
    height?: string | number;
    weight?: string | number;
    bloodGroup?: string;
    bodyType?: string;
    complexion?: string;
    disabilityStatus?: boolean;
    disabilityNote?: string;
  };
  education: {
    qualification?: string;
    field?: string;
    university?: string;
    occupationType?: string;
    occupation?: string;
    companyName?: string;
    jobRole?: string;
    annualIncomeAmount?: number;
  };
  family?: {
    fatherName?: string;
    motherName?: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
    siblings?: {
      brothersCount?: number;
      sistersCount?: number;
      marriedBrothersCount?: number;
      marriedSistersCount?: number;
      brothers?: number;
      sisters?: number;
      marriedBrothers?: number;
      marriedSisters?: number;
      details?: Array<{
        type?: string;
        married?: boolean;
        occupation?: string;
      }>;
      note?: string;
    };
  };
  preferences?: {
    languagesKnown?: string[];
  };
  images?: ProfileImage[];
  age?: number;
  height?: number;
  religion?: string;
  caste?: string;
  city?: string;
  location?: {
    type?: 'Point';
    coordinates?: [number, number];
  };
  gender?: string;
  profileScore?: number;
  profileCompletionPercentage?: number;
  isPremium?: boolean;
  isVerified?: boolean;
  status?: string;
  lastActiveAt?: string | Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | Date;
};

const DEFAULT_PROFILE: SchemaProfile = {
  profileFor: 'self',
  personal: {
    firstName: '',
    lastName: '',
    gender: Genders.MALE,
    dateOfBirth: '',
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
    languages: [],
    languagesKnown: [],
  },
  religion: Religions.HINDU,
  caste: '',
  gender: Genders.MALE,
  physical: {
    height: '',
    weight: '',
    bodyType: '',
    complexion: '',
  },
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
  preferences: {
    languagesKnown: [],
  },
  images: [],
};

const getApiBaseUrl = (): string =>
  String(process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

const resolveImageUrl = (url: string): string | null => {
  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) return null;
  if (/^(https?:|file:|data:)/i.test(trimmedUrl)) return trimmedUrl;

  const baseUrl = getApiBaseUrl();
  if (baseUrl.length === 0) return null;

  return `${baseUrl}${trimmedUrl.startsWith('/') ? '' : '/'}${trimmedUrl}`;
};

const getProfilePhotos = (images?: ProfileImage[]): string[] => {
  const photos =
    images
      ?.filter((image) => image.isActive !== false)
      .sort(
        (a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary))
      )
      .map((image) => resolveImageUrl(image.url))
      .filter((url): url is string => url !== null) ?? [];

  return photos.length > 0 ? photos : FALLBACK_PHOTOS;
};

const getPrintableProfilePhoto = (
  images?: ProfileImage[]
): string | undefined =>
  images
    ?.filter((image) => image.isActive !== false)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((image) => resolveImageUrl(image.url))
    .find(
      (url): url is string =>
        url !== null && /^(https:|data:)/i.test(url.trim())
    );

const getFormattedAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return EMPTY_VALUE;

  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return getAgeFromDOB(dateOfBirth);
};

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

const getFormattedHeight = (height: string | number | undefined): string => {
  const formatted = cmToFeetInches(height ?? '');
  return formatted || EMPTY_VALUE;
};

const getFormattedWeight = (weight: string | number | undefined): string => {
  const formatted = formatWeight(weight ?? '');
  return formatted || EMPTY_VALUE;
};

const getProfileHeight = (
  profile: SchemaProfile
): string | number | undefined =>
  profile.physical.height ?? profile.physical.height ?? profile.height;

const getProfileWeight = (
  profile: SchemaProfile
): string | number | undefined => profile.physical.weight;

const getProfileIncome = (
  profile: SchemaProfile
): string | number | undefined => profile.education.annualIncomeAmount;

const getDisplayName = (profile: SchemaProfile): string => {
  const name = getFullName(
    profile.personal.firstName ?? '',
    profile.personal.lastName ?? ''
  ).trim();

  return name || EMPTY_VALUE;
};

const getLocation = (profile: SchemaProfile): string =>
  [
    formatProfileText(profile.city ?? profile.personal.city),
    formatProfileText(profile.personal.state),
    formatProfileText(profile.personal.country),
  ]
    .filter((value) => value !== EMPTY_VALUE)
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
    .filter((value) => value !== EMPTY_VALUE)
    .join(', ') || EMPTY_VALUE;

const getChildrenSummary = (profile: SchemaProfile): string => {
  if (!profile.personal.hasChildren) return 'No';

  const sons = profile.personal.sonsCount ?? 0;
  const daughters = profile.personal.daughtersCount ?? 0;
  const childParts = [
    sons > 0 ? `${sons} son${sons === 1 ? '' : 's'}` : '',
    daughters > 0 ? `${daughters} daughter${daughters === 1 ? '' : 's'}` : '',
  ].filter(Boolean);

  return childParts.length > 0 ? childParts.join(', ') : 'Yes';
};

const getSiblingCounts = (profile: SchemaProfile): string => {
  const siblings = profile.family?.siblings;
  if (!siblings) return EMPTY_VALUE;

  const brothers = siblings.brothersCount ?? siblings.brothers ?? 0;
  const sisters = siblings.sistersCount ?? siblings.sisters ?? 0;
  const marriedBrothers =
    siblings.marriedBrothersCount ?? siblings.marriedBrothers ?? 0;
  const marriedSisters =
    siblings.marriedSistersCount ?? siblings.marriedSisters ?? 0;

  const parts = [
    `${brothers} brother${brothers === 1 ? '' : 's'}`,
    `${sisters} sister${sisters === 1 ? '' : 's'}`,
    `${marriedBrothers} married brother${marriedBrothers === 1 ? '' : 's'}`,
    `${marriedSisters} married sister${marriedSisters === 1 ? '' : 's'}`,
  ];

  return parts.join(', ');
};

const getSiblingDetails = (profile: SchemaProfile): string[] =>
  profile.family?.siblings?.details?.map((sibling) =>
    [
      formatProfileText(sibling.type),
      sibling.married ? 'Married' : 'Unmarried',
      formatProfileText(sibling.occupation),
    ]
      .filter((value) => value !== EMPTY_VALUE)
      .join(' • ')
  ) ?? [];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toStringList = (items: unknown): string[] =>
  Array.isArray(items)
    ? items.filter((item): item is string => typeof item === 'string')
    : [];

const formatList = (items: unknown): string =>
  toStringList(items).filter(Boolean).join(', ') || EMPTY_VALUE;

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

  const destinationUri = `${FileSystem.documentDirectory}${getPdfFileName(
    profile
  )}`;

  await FileSystem.deleteAsync(destinationUri, { idempotent: true });
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  return destinationUri;
};

const getPdfRows = (profile: SchemaProfile): Array<[string, string]> => [
  ['Name', getDisplayName(profile)],
  ['Profile For', formatProfileText(profile.profileFor)],
  [
    'Age',
    toDisplayText(profile.age) !== EMPTY_VALUE
      ? `${profile.age} yrs`
      : getFormattedAge(profile.personal.dateOfBirth ?? ''),
  ],
  ['Date of Birth', toDisplayText(profile.personal.dateOfBirth)],
  ['Gender', formatProfileText(profile.gender ?? profile.personal.gender)],
  ['Height', getFormattedHeight(getProfileHeight(profile))],
  ['Location', getLocation(profile)],
  ['Marital Status', formatMaritalStatus(profile.personal.maritalStatus ?? '')],
  ['Religion', formatProfileText(profile.religion)],
  ['Caste', formatProfileText(profile.caste)],
  ['Mother Tongue', formatProfileText(profile.personal.motherTongue)],
  ['Manglik Status', formatProfileText(profile.personal.manglikStatus)],
  ['Time of Birth', getTimeOfBirth(profile)],
  ['Place of Birth', getPlaceOfBirth(profile)],
  ['Education', formatProfileText(profile.education.qualification)],
  ['Field of Study', formatProfileText(profile.education.field)],
  ['College', formatProfileText(profile.education.university)],
  ['Occupation Type', formatProfileText(profile.education.occupationType)],
  ['Profession', formatProfileText(profile.education.occupation)],
  ['Company', formatProfileText(profile.education.companyName)],
  ['Job Role', formatProfileText(profile.education.jobRole)],
  ['Annual Income', annualIncomeFormat(getProfileIncome(profile) ?? '')],
  ['Weight', getFormattedWeight(getProfileWeight(profile))],
  ['Blood Group', toDisplayText(profile.physical.bloodGroup)],
  ['Body Type', formatProfileText(profile.physical.bodyType)],
  ['Complexion', formatProfileText(profile.physical.complexion)],
  ['Disability', toDisplayText(profile.physical.disabilityStatus)],
  ['Smoking', formatLifestyleChoice(profile.personal.smoking ?? '')],
  ['Drinking', formatLifestyleChoice(profile.personal.drinking ?? '')],
  ['Eating', formatLifestyleChoice(profile.personal.eating ?? '')],
  ['Father', formatProfileText(profile.family?.fatherName)],
  ['Mother', formatProfileText(profile.family?.motherName)],
  ['Father Occupation', formatProfileText(profile.family?.fatherOccupation)],
  ['Mother Occupation', formatProfileText(profile.family?.motherOccupation)],
  ['Family Type', formatProfileText(profile.family?.familyType)],
  ['Family Status', formatProfileText(profile.family?.familyStatus)],
  ['Family Values', formatProfileText(profile.family?.familyValues)],
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
  profileSummary: string
): string => {
  const rows = getPdfRows(profile)
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
          body {
            margin: 0;
            padding: 32px;
            color: #1f2933;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #f6f8fb;
          }
          .page {
            background: #ffffff;
            border: 1px solid #e5e9f0;
            border-radius: 18px;
            overflow: hidden;
          }
          .hero {
            display: flex;
            gap: 24px;
            padding: 28px;
            background: #fff7f1;
            border-bottom: 1px solid #efe3d7;
          }
          .photo {
            width: 150px;
            height: 188px;
            border-radius: 14px;
            object-fit: cover;
            background: #e5e7eb;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 30px;
            line-height: 1.2;
          }
          .summary, .location {
            margin: 0 0 8px;
            color: #667085;
            font-size: 14px;
          }
          .section {
            padding: 24px 28px;
          }
          h2 {
            margin: 0 0 12px;
            color: #344054;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .about {
            margin: 0 0 20px;
            color: #344054;
            font-size: 14px;
            line-height: 1.65;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px 0;
            border-bottom: 1px solid #edf1f5;
            vertical-align: top;
            font-size: 13px;
          }
          th {
            width: 34%;
            color: #667085;
            font-weight: 600;
            text-align: left;
          }
          td {
            color: #111827;
            text-align: right;
            font-weight: 500;
          }
          .footer {
            padding: 16px 28px;
            color: #98a2b3;
            font-size: 11px;
            text-align: center;
            background: #fbfcfd;
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero">
            ${
              photoUrl
                ? `<img class="photo" src="${escapeHtml(photoUrl)}" />`
                : '<div class="photo"></div>'
            }
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
    </html>
  `;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen({
  navigation,
}: ProfileScreenProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [pdfAction, setPdfAction] = useState<PdfAction | null>(null);
  const { data, isLoading, isFetching, isError, refetch } =
    useGetMyProfileQuery();

  const profileData = useMemo<SchemaProfile>(
    () =>
      data?.success ? (data.data as unknown as SchemaProfile) : DEFAULT_PROFILE,
    [data]
  );

  const hobbies = useMemo(
    () => toStringList(profileData.personal.hobbies),
    [profileData.personal.hobbies]
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

  const profileSummary = useMemo(
    () =>
      [
        getFormattedAge(profileData.personal.dateOfBirth ?? ''),
        getFormattedHeight(getProfileHeight(profileData)),
        formatMaritalStatus(profileData.personal.maritalStatus ?? '') ||
          EMPTY_VALUE,
      ]
        .filter((value) => value !== EMPTY_VALUE)
        .join(' • ') || EMPTY_VALUE,
    [profileData]
  );

  const fetchProfile = useCallback((): void => {
    void refetch();
  }, [refetch]);

  const handleProfilePdf = useCallback(
    async (action: PdfAction): Promise<void> => {
      if (pdfAction !== null) return;

      setPdfAction(action);

      try {
        const printPdf = async (
          photoUrl: string | undefined
        ): Promise<string> => {
          const html = createProfilePdfHtml(
            profileData,
            photoUrl,
            profileSummary
          );
          const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
          });

          return uri;
        };

        let uri: string;

        try {
          uri = await printPdf(printablePhoto);
        } catch (error) {
          if (__DEV__) {
            console.warn('Profile PDF failed with photo, retrying', error);
          }
          uri = await printPdf(undefined);
        }

        const pdfUri = await copyPdfToDocumentDirectory(uri, profileData);

        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          showError({
            title: 'Sharing is unavailable',
            message: `Your profile PDF was created at ${pdfUri}`,
          });
          return;
        }

        await Sharing.shareAsync(pdfUri, {
          dialogTitle:
            action === 'download' ? 'Save profile PDF' : 'Share profile PDF',
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
        });
      } catch (error) {
        if (__DEV__) {
          console.warn('Profile PDF generation failed', error);
        }
        showError({
          title: 'PDF failed',
          message: 'We could not create your profile PDF. Please try again.',
        });
      } finally {
        setPdfAction(null);
      }
    },
    [pdfAction, printablePhoto, profileData, profileSummary]
  );

  const renderPhoto: ListRenderItem<string> = useCallback(
    ({ item, index }) => (
      <Image
        source={{ uri: item }}
        style={styles.photo}
        resizeMode="cover"
        accessibilityLabel={`Profile photo ${index + 1}`}
      />
    ),
    [styles]
  );

  // ─── Error state ─────────────────────────────────────────────────────────

  if (!isLoading && (isError || data?.success === false)) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color={theme.colors.danger} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>
          {data?.success === false
            ? data.message
            : 'Failed to load profile. Please try again.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProfile}
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>
            {isFetching ? 'Trying...' : 'Try Again'}
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
          title="My Profile"
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
      {/* Header */}
      <Header
        title="My Profile"
        actions={[
          {
            icon: 'settings',
            onPress: () => navigation.navigate('Settings'),
          },
        ]}
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photo Carousel */}
        <View>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderPhoto}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / windowWidth
              );
              setActivePhotoIndex(Math.min(index, photos.length - 1));
            }}
            scrollEventThrottle={16}
          />
          {/* Dot Indicators */}
          {photos.length > 1 && (
            <View style={styles.dotRow}>
              {photos.map((_, i) => (
                <View
                  key={i.toString()}
                  style={[
                    styles.dot,
                    i === activePhotoIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Name & Basic */}
        <View style={styles.nameCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{getDisplayName(profileData)}</Text>
            <View style={styles.verifiedBadge}>
              <Feather
                name="check-circle"
                size={14}
                color={theme.colors.primary}
              />
              <Text style={styles.verifiedText}>
                {profileData.isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
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
              <Text style={styles.profileMetaLabel}>Complete</Text>
            </View>
            <View style={styles.profileMetaItem}>
              <Text style={styles.profileMetaValue}>
                {toDisplayText(profileData.profileScore)}
              </Text>
              <Text style={styles.profileMetaLabel}>Score</Text>
            </View>
            <View style={styles.profileMetaItem}>
              <Text style={styles.profileMetaValue}>
                {formatProfileText(profileData.status)}
              </Text>
              <Text style={styles.profileMetaLabel}>Status</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <Section title="About Me" icon="user">
          <Text style={styles.aboutText}>
            {formatAboutMe(profileData.personal.aboutMe)}
          </Text>
        </Section>

        <Section title="Profile Overview" icon="award">
          <Row
            label="Profile For"
            value={formatProfileText(profileData.profileFor)}
          />
          <Row
            label="Gender"
            value={formatProfileText(
              profileData.gender ?? profileData.personal.gender
            )}
          />
          <Row
            label="City"
            value={formatProfileText(
              profileData.city ?? profileData.personal.city
            )}
          />
          <Row label="Premium" value={toDisplayText(profileData.isPremium)} />
          <Row
            label="Last Active"
            value={formatDateTime(profileData.lastActiveAt)}
          />
        </Section>

        <Section title="Personal Details" icon="user-check">
          <Row
            label="Date of Birth"
            value={toDisplayText(profileData.personal.dateOfBirth)}
          />
          <Row label="Time of Birth" value={getTimeOfBirth(profileData)} />
          <Row label="Place of Birth" value={getPlaceOfBirth(profileData)} />
          <Row
            label="Marital Status"
            value={formatMaritalStatus(
              profileData.personal.maritalStatus ?? ''
            )}
          />
          <Row label="Children" value={getChildrenSummary(profileData)} />
          <Row
            label="Willing to Relocate"
            value={toDisplayText(profileData.personal.willingToRelocate)}
          />
          <Row
            label="Citizenship"
            value={formatProfileText(profileData.personal.citizenship)}
          />
        </Section>

        <Section title="Religious & Astro" icon="sun">
          <Row
            label="Religion"
            value={formatProfileText(profileData.religion)}
          />
          <Row label="Caste" value={formatProfileText(profileData.caste)} />
          <Row
            label="Sub Caste"
            value={formatProfileText(profileData.personal.subCast)}
          />
          <Row
            label="Gotra"
            value={formatProfileText(profileData.personal.gotra)}
          />
          <Row
            label="Mother Tongue"
            value={formatProfileText(profileData.personal.motherTongue)}
          />
          <Row
            label="Manglik Status"
            value={formatProfileText(profileData.personal.manglikStatus)}
          />
          <Row
            label="Rashi"
            value={formatProfileText(profileData.personal.rashi)}
          />
          <Row
            label="Nakshatra"
            value={formatProfileText(profileData.personal.nakshatra)}
          />
          <Row
            label="Kundli"
            value={toDisplayText(profileData.personal.kundliFileUrl)}
          />
        </Section>

        {/* Education & Career */}
        <Section title="Education & Career" icon="book">
          <Row
            label="Education"
            value={formatProfileText(profileData.education.qualification)}
          />
          <Row
            label="Field"
            value={formatProfileText(profileData.education.field)}
          />
          <Row
            label="College"
            value={formatProfileText(profileData.education.university)}
          />
          <Row
            label="Occupation Type"
            value={formatProfileText(profileData.education.occupationType)}
          />
          <Row
            label="Profession"
            value={formatProfileText(profileData.education.occupation)}
          />
          <Row
            label="Company"
            value={formatProfileText(profileData.education.companyName)}
          />
          <Row
            label="Job Role"
            value={formatProfileText(profileData.education.jobRole)}
          />
          <Row
            label="Annual Income"
            value={annualIncomeFormat(getProfileIncome(profileData) ?? '')}
          />
        </Section>

        {/* Physical Attributes */}
        <Section title="Physical Attributes" icon="activity">
          <Row
            label="Height"
            value={getFormattedHeight(getProfileHeight(profileData))}
          />
          <Row
            label="Weight"
            value={getFormattedWeight(getProfileWeight(profileData))}
          />
          <Row
            label="Blood Group"
            value={toDisplayText(profileData.physical.bloodGroup)}
          />
          <Row
            label="Body Type"
            value={formatProfileText(profileData.physical.bodyType)}
          />
          <Row
            label="Complexion"
            value={formatProfileText(profileData.physical.complexion)}
          />
          <Row
            label="Disability"
            value={toDisplayText(profileData.physical.disabilityStatus)}
          />
          <Row
            label="Disability Note"
            value={toDisplayText(profileData.physical.disabilityNote)}
          />
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle" icon="coffee">
          <Row
            label="Smoking"
            value={formatLifestyleChoice(profileData.personal.smoking ?? '')}
          />
          <Row
            label="Drinking"
            value={formatLifestyleChoice(profileData.personal.drinking ?? '')}
          />
          <Row
            label="Eating"
            value={formatLifestyleChoice(profileData.personal.eating ?? '')}
          />
        </Section>

        {/* Family Background */}
        <Section title="Family Background" icon="home">
          <Row
            label="Father's Name"
            value={formatProfileText(profileData.family?.fatherName)}
          />
          <Row
            label="Mother's Name"
            value={formatProfileText(profileData.family?.motherName)}
          />
          <Row
            label="Father's Occupation"
            value={formatProfileText(profileData.family?.fatherOccupation)}
          />
          <Row
            label="Mother's Occupation"
            value={formatProfileText(profileData.family?.motherOccupation)}
          />
          <Row
            label="Family Type"
            value={formatProfileText(profileData.family?.familyType)}
          />
          <Row
            label="Family Status"
            value={formatProfileText(profileData.family?.familyStatus)}
          />
          <Row
            label="Family Values"
            value={formatProfileText(profileData.family?.familyValues)}
          />
          <Row label="Siblings" value={getSiblingCounts(profileData)} />
          <Row
            label="Sibling Note"
            value={toDisplayText(profileData.family?.siblings?.note)}
          />
          {siblingDetails.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Sibling Details</Text>
              <TagList items={siblingDetails} />
            </View>
          )}
        </Section>

        {/* Interests & Hobbies */}
        <Section title="Interests & Hobbies" icon="music">
          {hobbies.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Hobbies</Text>
              <TagList items={hobbies} />
            </View>
          )}
          <Row label="Languages Known" value={languagesKnown} />
        </Section>
        <View style={styles.footer} />
      </ScrollView>

      <View style={styles.pdfActionBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Download profile as PDF"
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
            {pdfAction === 'download' ? 'Preparing...' : 'Download PDF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Share profile PDF"
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
            {pdfAction === 'share' ? 'Preparing...' : 'Share PDF'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
