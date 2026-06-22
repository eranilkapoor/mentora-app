import React, { useEffect, useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { getApiErrorMessage } from '@/core/utils/apiMessage';
import { cmToFeetInches, formatEnumLabel } from '@/core/utils/format';
import { useGetMatchProfileQuery } from '@/store/services/matchApi.service';
import { matchDetailStyles } from './MatchDetail.styles';
import { MatchDetailScreenProps, PrimaryAction } from './MatchDetail.types';
import { EMPTY, HIDDEN_KEY } from './MatchDetail.constants';
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

const getApiErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return undefined;
  }

  const data = (error as { data?: unknown }).data;
  if (data && typeof data === 'object' && 'code' in data) {
    const code = (data as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }

  return undefined;
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
  const profile = data?.data ?? undefined;
  const errorCode = getApiErrorCode(error);
  const isPlanRestricted =
    errorCode === 'SUBSCRIPTION.FEATURE_NOT_AVAILABLE' ||
    errorCode === 'SUBSCRIPTION.REQUIRED';
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

    if (
      code === 'SUBSCRIPTION.FEATURE_NOT_AVAILABLE' ||
      code === 'SUBSCRIPTION.REQUIRED'
    ) {
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
          profile?.personal?.caste,
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
          EMPTY
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
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

        {/* ── Chips row ────────────────────────────────────────── */}
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
              profile.personal?.caste,
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
