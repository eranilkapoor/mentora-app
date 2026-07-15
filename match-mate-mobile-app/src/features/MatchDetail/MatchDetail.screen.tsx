import React, { useEffect, useMemo } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  getApiErrorCode,
  getApiErrorMessage,
  isPlanAccessError,
} from '@/core/utils/apiMessage';
import { resolveApiUrl } from '@/core/utils/config';
import { cmToFeetInches, formatEnumLabel } from '@/core/utils/format';
import { useGetMatchProfileQuery } from '@/store/services/matchApi.service';
import { useGetMyPreferenceQuery } from '@/store/services/preferenceApi.service';
import { useGetMyProfileQuery } from '@/store/services/profileApi.service';
import { matchDetailStyles } from './MatchDetail.styles';
import { MatchDetailScreenProps, PrimaryAction } from './MatchDetail.types';
import { HIDDEN_KEY } from './MatchDetail.constants';
import { EMPTY_DISPLAY_VALUE } from '@/core/constants';
import {
  compact,
  getPhotos,
  getPhotoItems,
  getProfileName,
  isRecentlyActive,
} from './MatchDetail.utils';
import { useMatchDetailActions } from './hooks/useMatchDetailActions';
import { DetailSection } from './components/DetailSection';
import { DetailRow } from './components/DetailRow';
import { DetailPhotoCarousel } from './components/DetailPhotoCarousel';
import { MatchScoreBar } from './components/MatchScoreBar';
import { MatchDetailCta } from './components/MatchDetailCta';
import { MatchDetailEmpty } from './components/MatchDetailEmpty';
import { useUpgradePrompt } from '../Membership/hooks/useUpgradePrompt';

const calculateAge = (dateOfBirth?: string | Date): number | undefined => {
  if (!dateOfBirth) return undefined;

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const getPrimaryPhotoUrl = (
  images?: Array<{ url?: string; isPrimary?: boolean; isActive?: boolean }>
): string | undefined => {
  const photo =
    images?.find((item) => item.isPrimary && item.url) ??
    images?.find((item) => item.isActive !== false && item.url) ??
    images?.find((item) => item.url);

  return photo?.url ? (resolveApiUrl(photo.url) ?? undefined) : undefined;
};

const formatCompatibilityScore = (score?: number): string =>
  `${Math.max(0, Math.min(100, Math.round(score ?? 0)))}%`;

const clampPercent = (score: number): number =>
  Math.max(0, Math.min(100, Math.round(score)));

const getRangePreferenceScore = (
  value: unknown,
  range?: { min?: number | null; max?: number | null },
  idealValue?: number
): number => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return 0;
  if (!range?.min && !range?.max) return 100;

  const min = Number(range.min ?? Number.MIN_SAFE_INTEGER);
  const max = Number(range.max ?? Number.MAX_SAFE_INTEGER);
  const isInsideRange = numericValue >= min && numericValue <= max;

  if (isInsideRange) {
    if (idealValue === undefined || Number.isNaN(idealValue)) return 100;

    const distanceFromIdeal = Math.abs(numericValue - idealValue);
    if (distanceFromIdeal <= 1) return 100;

    return clampPercent(100 - (distanceFromIdeal - 1) * 5);
  }

  const distanceFromRange =
    numericValue < min ? min - numericValue : numericValue - max;
  return clampPercent(80 - distanceFromRange * 10);
};

const getListPreferenceScore = (
  value: unknown,
  preferredValues?: unknown[]
): number => {
  const values = Array.isArray(preferredValues)
    ? preferredValues.filter(Boolean)
    : [];
  if (values.length === 0) return 100;
  if (value === undefined || value === null || value === '') return 0;

  return values.includes(value) ? 100 : 0;
};

const getTextListPreferenceScore = (
  value: unknown,
  preferredValues?: string[]
): number => {
  const normalizedValue = String(value ?? '')
    .trim()
    .toLowerCase();
  const values = Array.isArray(preferredValues)
    ? preferredValues.map((item) => item.trim().toLowerCase()).filter(Boolean)
    : [];
  if (values.length === 0) return 100;
  if (!normalizedValue) return 0;

  if (values.includes(normalizedValue)) return 100;
  return values.some(
    (item) => item.includes(normalizedValue) || normalizedValue.includes(item)
  )
    ? 70
    : 0;
};

const getProgressFillStyle = (
  score: number,
  styles: ReturnType<typeof matchDetailStyles>
): StyleProp<ViewStyle> => {
  const bucket = Math.round(clampPercent(score) / 5) * 5;
  const key = `preferenceFill${bucket}` as keyof typeof styles;
  return (styles as Record<string, StyleProp<ViewStyle>>)[key];
};

export default function MatchDetailScreen({
  navigation,
  route,
}: MatchDetailScreenProps): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const showUpgradePrompt = useUpgradePrompt();
  const { userId } = route.params;

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetMatchProfileQuery(userId);
  const { data: myProfileData } = useGetMyProfileQuery();
  const { data: myPreferenceData } = useGetMyPreferenceQuery();
  const profile = data?.data ?? undefined;
  const myProfile = myProfileData?.data;
  const myPreference = myPreferenceData?.data;
  const errorCode = getApiErrorCode(error);
  const isPlanRestricted = isPlanAccessError(error);
  const name = getProfileName(profile);
  const photos = useMemo(() => getPhotos(profile), [profile]);
  const photoItems = useMemo(() => getPhotoItems(profile), [profile]);
  const emptyState = useMemo(() => {
    if (!isError) return undefined;

    const code = errorCode;
    if (code === 'PROFILE.NOT_FOUND') {
      return {
        title: t('match_detail.unavailable_title'),
        subtitle: t('match_detail.unavailable_subtitle'),
      };
    }

    if (isPlanAccessError(error)) {
      return {
        title: t('match_detail.access_limited_title', {
          defaultValue: 'Profile Views Limited',
        }),
        subtitle: getApiErrorMessage(
          t,
          error,
          'match_detail.access_limited_subtitle'
        ),
      };
    }

    return {
      title: t('match_detail.load_failed_title', {
        defaultValue: 'Unable to Load Profile',
      }),
      subtitle: getApiErrorMessage(t, error, 'common.something_went_wrong'),
    };
  }, [error, errorCode, isError, t]);

  const {
    optimisticPendingInterest,
    resetOptimistic,
    handleSendInterest,
    handleWithdrawInterest,
    handleOpenChat,
    handleReport,
    handleBlock,
    isSendingInterest,
    isWithdrawingInterest,
    isOpeningChat,
    isBlocking,
    isReporting,
  } = useMatchDetailActions(userId, name, photos, navigation);

  useEffect(() => {
    resetOptimistic();
  }, [userId, resetOptimistic]);

  // ─── Derived state ────────────────────────────────────────────────────

  const canViewDetails = Boolean(profile?.privacy?.canViewPersonalDetails);
  const isMatched = Boolean(profile?.privacy?.isMatched);
  const online = isRecentlyActive(profile?.lastActiveAt);
  const location = compact([
    profile?.personal?.city,
    profile?.personal?.state,
    profile?.personal?.country,
  ]);

  const pendingSentInterest =
    optimisticPendingInterest ||
    (profile?.relationship?.interestDirection === 'sent' &&
      profile.relationship.interestStatus === 'pending');

  const pendingReceivedInterest =
    profile?.relationship?.interestDirection === 'received' &&
    profile.relationship.interestStatus === 'pending';

  // ─── Chips ────────────────────────────────────────────────────────────

  const hidden = t(HIDDEN_KEY);
  const myAge = calculateAge(myProfile?.personal?.dateOfBirth);
  const myName = compact([
    myProfile?.personal?.firstName,
    myProfile?.personal?.lastName,
  ]);
  const myPhoto = getPrimaryPhotoUrl(myProfile?.images);
  const matchPhoto = getPrimaryPhotoUrl(profile?.images);
  const compatibilityScore =
    profile?.compatibility?.score ?? profile?.matchScore ?? 0;
  const getCompatibilitySignal = (key: string) =>
    profile?.compatibility?.signals?.find((signal) => signal.key === key);
  const preferenceFilters = myPreference?.filters;
  const compatibilityRows = [
    {
      key: 'age',
      label: t('match_detail.field_age'),
      mine: myAge ? t('match_detail.years', { count: myAge }) : hidden,
      match: profile?.age
        ? t('match_detail.years', { count: profile.age })
        : hidden,
      signal: getCompatibilitySignal('age'),
      score: getRangePreferenceScore(
        profile?.age,
        preferenceFilters?.age,
        myAge
      ),
    },
    {
      key: 'height',
      label: t('match_detail.field_height'),
      mine: myProfile?.physical?.height
        ? cmToFeetInches(myProfile.physical.height) ||
          String(myProfile.physical.height)
        : hidden,
      match: profile?.physical?.height
        ? cmToFeetInches(profile.physical.height) ||
          String(profile.physical.height)
        : hidden,
      signal: getCompatibilitySignal('height'),
      score: getRangePreferenceScore(
        profile?.physical?.height,
        preferenceFilters?.height,
        Number(myProfile?.physical?.height)
      ),
    },
    {
      key: 'religion',
      label: t('match_detail.field_religion'),
      mine: formatEnumLabel(
        t,
        'options.religion',
        myProfile?.personal?.religion,
        hidden
      ),
      match: formatEnumLabel(
        t,
        'options.religion',
        profile?.personal?.religion,
        hidden
      ),
      signal: getCompatibilitySignal('religion'),
      score: getListPreferenceScore(
        profile?.personal?.religion,
        preferenceFilters?.religion
      ),
    },
    {
      key: 'caste',
      label: t('match_detail.field_caste'),
      mine: formatEnumLabel(
        t,
        'options.caste',
        myProfile?.personal?.religiousDetails?.caste,
        hidden
      ),
      match: formatEnumLabel(
        t,
        'options.caste',
        profile?.personal?.religiousDetails?.caste,
        hidden
      ),
      signal: getCompatibilitySignal('caste'),
      score: getListPreferenceScore(
        profile?.personal?.religiousDetails?.caste,
        preferenceFilters?.caste
      ),
    },
    {
      key: 'education',
      label: t('match_detail.field_education'),
      mine: formatEnumLabel(
        t,
        'options.qualifications',
        myProfile?.education?.qualification,
        hidden
      ),
      match: formatEnumLabel(
        t,
        'options.qualifications',
        profile?.education?.qualification,
        hidden
      ),
      signal: getCompatibilitySignal('education'),
      score: getListPreferenceScore(
        profile?.education?.qualification,
        preferenceFilters?.qualification
      ),
    },
    {
      key: 'profession',
      label: t('match_detail.field_profession'),
      mine:
        myProfile?.education?.jobRole ??
        myProfile?.education?.occupation ??
        hidden,
      match:
        profile?.education?.jobRole ?? profile?.education?.occupation ?? hidden,
      signal: getCompatibilitySignal('occupation'),
      score: preferenceFilters?.occupation?.length
        ? getTextListPreferenceScore(
            profile?.education?.jobRole ?? profile?.education?.occupation,
            preferenceFilters.occupation
          )
        : preferenceFilters?.occupationType?.length
          ? 0
          : 100,
    },
  ];

  const chips = useMemo(
    () => [
      {
        icon: 'sun',
        label: formatEnumLabel(
          t,
          'options.religion',
          profile?.personal?.religion,
          hidden
        ),
      },
      {
        icon: 'users',
        label: formatEnumLabel(
          t,
          'options.caste',
          profile?.personal?.religiousDetails?.caste,
          hidden
        ),
      },
      {
        icon: 'trending-up',
        label: profile?.physical?.height
          ? cmToFeetInches(profile.physical.height) ||
            String(profile.physical.height)
          : hidden,
      },
      {
        icon: 'heart',
        label: formatEnumLabel(
          t,
          'options.marital_status',
          profile?.personal?.maritalStatus,
          EMPTY_DISPLAY_VALUE
        ),
      },
    ],
    [profile, t, hidden]
  );

  // ─── Primary action ───────────────────────────────────────────────────

  const primaryAction = useMemo<PrimaryAction>(() => {
    if (isMatched) {
      return {
        icon: 'message-circle',
        labelKey: 'match_detail.action_chat',
        disabled: isOpeningChat,
        onPress: handleOpenChat,
      };
    }
    if (pendingSentInterest) {
      return {
        icon: 'x-circle',
        labelKey: 'match_detail.action_withdraw',
        disabled: isWithdrawingInterest || !profile?.relationship?.interestId,
        onPress: () =>
          handleWithdrawInterest(profile?.relationship?.interestId),
      };
    }
    if (pendingReceivedInterest) {
      return {
        icon: 'inbox',
        labelKey: 'match_detail.action_interest_received',
        disabled: true,
        onPress: () => undefined,
      };
    }
    return {
      icon: 'heart',
      labelKey: 'match_detail.action_send_interest',
      disabled: isSendingInterest,
      onPress: handleSendInterest,
    };
  }, [
    isMatched,
    isOpeningChat,
    handleOpenChat,
    pendingSentInterest,
    isWithdrawingInterest,
    profile?.relationship?.interestId,
    handleWithdrawInterest,
    pendingReceivedInterest,
    isSendingInterest,
    handleSendInterest,
  ]);

  // ─── Loading / empty ──────────────────────────────────────────────────

  if (isLoading || !profile) {
    return (
      <MatchDetailEmpty
        isLoading={isLoading || isFetching}
        title={emptyState?.title}
        subtitle={emptyState?.subtitle}
        actionLabel={
          !isLoading
            ? isPlanRestricted
              ? t('membership.locked_feature.view_plans')
              : t('common.retry')
            : undefined
        }
        onAction={
          !isLoading
            ? isPlanRestricted
              ? () => showUpgradePrompt(t('match_detail.access_limited_title'))
              : refetch
            : undefined
        }
      />
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Photo carousel ───────────────────────────────────── */}
        <View style={styles.carouselWrapper}>
          <DetailPhotoCarousel photos={photoItems} name={name} />
          <View style={styles.carouselScrim} />

          {/* Hero overlay */}
          <View style={styles.heroOverlay}>
            {online && (
              <View style={styles.onlinePill}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlinePillText}>
                  {t('match_detail.online_now')}
                </Text>
              </View>
            )}
            <Text style={styles.heroName}>
              {name}
              {profile.age ? `, ${profile.age}` : ''}
            </Text>
            <View style={styles.heroLocationRow}>
              <Feather
                name="map-pin"
                size={13}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.heroLocation}>{location}</Text>
            </View>
          </View>
        </View>

        {/* ── Match score ──────────────────────────────────────── */}
        <MatchScoreBar
          matchScore={profile.matchScore ?? profile.profileScore ?? 0}
          canViewDetails={canViewDetails}
        />

        <View style={styles.chipsRow}>
          {chips.map((chip) => (
            <View key={`${chip.icon}-${chip.label}`} style={styles.chip}>
              <Feather
                name={chip.icon as never}
                size={12}
                color={theme.colors.primary}
              />
              <Text style={styles.chipText}>{chip.label}</Text>
            </View>
          ))}
        </View>

        {/* ── About ────────────────────────────────────────────── */}
        <DetailSection title={t('match_detail.section_about')} icon="user">
          <Text style={styles.aboutText}>
            {profile.personal?.aboutMe ??
              (canViewDetails ? t('match_detail.no_introduction') : hidden)}
          </Text>
        </DetailSection>

        {/* ── Basic Details ─────────────────────────────────────── */}
        <DetailSection title={t('match_detail.section_basic')} icon="info">
          <DetailRow
            label={t('match_detail.field_name')}
            value={name}
            icon="user"
          />
          <DetailRow
            label={t('match_detail.field_age')}
            value={
              profile.age
                ? t('match_detail.years', { count: profile.age })
                : hidden
            }
            icon="calendar"
          />
          <DetailRow
            label={t('match_detail.field_height')}
            value={
              profile.physical?.height
                ? cmToFeetInches(profile.physical.height) ||
                  String(profile.physical.height)
                : hidden
            }
            icon="trending-up"
          />
          <DetailRow
            label={t('match_detail.field_religion')}
            value={formatEnumLabel(
              t,
              'options.religion',
              profile.personal?.religion,
              hidden
            )}
            icon="sun"
          />
          <DetailRow
            label={t('match_detail.field_caste')}
            value={formatEnumLabel(
              t,
              'options.caste',
              profile.personal?.religiousDetails?.caste,
              hidden
            )}
            icon="users"
            isLast
          />
        </DetailSection>

        {/* ── Education & Career ───────────────────────────────── */}
        <DetailSection title={t('match_detail.section_education')} icon="book">
          <DetailRow
            label={t('match_detail.field_education')}
            value={formatEnumLabel(
              t,
              'options.qualifications',
              profile.education?.qualification,
              hidden
            )}
            icon="book"
          />
          <DetailRow
            label={t('match_detail.field_profession')}
            value={
              profile.education?.jobRole ??
              profile.education?.occupation ??
              hidden
            }
            icon="briefcase"
          />
          <DetailRow
            label={t('match_detail.field_company')}
            value={profile.education?.companyName ?? hidden}
            icon="briefcase"
          />
          <DetailRow
            label={t('match_detail.field_income')}
            value={
              profile.privacy?.showIncome &&
              profile.education?.annualIncomeAmount
                ? String(profile.education.annualIncomeAmount)
                : hidden
            }
            icon="dollar-sign"
            isLast
          />
        </DetailSection>

        {/* ── Family ───────────────────────────────────────────── */}
        <DetailSection title={t('match_detail.section_family')} icon="home">
          <DetailRow
            label={t('match_detail.field_family_type')}
            value={formatEnumLabel(
              t,
              'options.family_types',
              profile.family?.familyType,
              hidden
            )}
            icon="home"
          />
          <DetailRow
            label={t('match_detail.field_family_status')}
            value={formatEnumLabel(
              t,
              'options.family_status',
              profile.family?.familyStatus,
              hidden
            )}
            icon="shield"
          />
          <DetailRow
            label={t('match_detail.field_father_occupation')}
            value={profile.family?.fatherOccupation ?? hidden}
            icon="briefcase"
            isLast
          />
        </DetailSection>

        {/* ── Safety ───────────────────────────────────────────── */}
        <DetailSection
          title={t('match_detail.section_compatibility')}
          icon="activity"
        >
          <View style={styles.compatibilityHeader}>
            <View style={styles.compatibilityPerson}>
              {myPhoto ? (
                <Image source={{ uri: myPhoto }} style={styles.compareAvatar} />
              ) : (
                <View style={styles.compareAvatarFallback}>
                  <Feather name="user" size={18} color={theme.colors.primary} />
                </View>
              )}
              <Text style={styles.compareName} numberOfLines={1}>
                {myName || t('match_detail.you')}
              </Text>
            </View>
            <View style={styles.compatibilityScoreBadge}>
              <Text style={styles.compatibilityScoreValue}>
                {formatCompatibilityScore(compatibilityScore)}
              </Text>
              <Text style={styles.compatibilityScoreLabel}>
                {t('match_detail.exact_score')}
              </Text>
            </View>
            <View style={styles.compatibilityPerson}>
              {matchPhoto ? (
                <Image
                  source={{ uri: matchPhoto }}
                  style={styles.compareAvatar}
                />
              ) : (
                <View style={styles.compareAvatarFallback}>
                  <Feather name="user" size={18} color={theme.colors.primary} />
                </View>
              )}
              <Text style={styles.compareName} numberOfLines={1}>
                {name}
              </Text>
            </View>
          </View>

          {compatibilityRows.map((row, index) => (
            <View
              key={row.key}
              style={[
                styles.compareRow,
                index === compatibilityRows.length - 1 && styles.compareRowLast,
              ]}
            >
              <Text style={styles.compareValue} numberOfLines={2}>
                {row.mine}
              </Text>
              <View style={styles.compareField}>
                <View style={styles.compareLabelRow}>
                  <Text style={styles.compareLabel}>{row.label}</Text>
                </View>
                <View style={styles.preferenceTrack}>
                  <View
                    style={[
                      styles.preferenceFill,
                      getProgressFillStyle(row.score, styles),
                    ]}
                  />
                </View>
                <Text style={styles.preferenceScoreText}>
                  {formatCompatibilityScore(row.score)}
                </Text>
              </View>
              <Text style={styles.compareValue} numberOfLines={2}>
                {row.match}
              </Text>
            </View>
          ))}
        </DetailSection>

        {/* ── Chips row ────────────────────────────────────────── */}
        <DetailSection title={t('match_detail.section_safety')} icon="shield">
          <View style={styles.safetyActions}>
            <TouchableOpacity
              style={styles.safetyButton}
              onPress={handleReport}
              disabled={isReporting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('match_detail.report_confirm')}
            >
              <Feather
                name="flag"
                size={15}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.safetyButtonText}>
                {t('match_detail.action_report')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.safetyButton, styles.safetyButtonDanger]}
              onPress={handleBlock}
              disabled={isBlocking}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('match_detail.block_confirm')}
            >
              <Feather name="slash" size={15} color={theme.colors.error} />
              <Text
                style={[styles.safetyButtonText, styles.safetyButtonTextDanger]}
              >
                {t('match_detail.action_block')}
              </Text>
            </TouchableOpacity>
          </View>
        </DetailSection>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* ── Sticky CTA ───────────────────────────────────────────── */}
      <MatchDetailCta
        primaryAction={primaryAction}
        onBack={navigation.goBack}
      />
    </SafeAreaView>
  );
}
