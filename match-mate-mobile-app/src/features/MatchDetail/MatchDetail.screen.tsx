import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { windowWidth } from '../../core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { resolveApiUrl } from '@/core/utils/config';
import { cmToFeetInches, formatEnumLabel } from '@/core/utils/format';
import { MatchesStackParamList } from '@/navigation/types';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  DiscoveryProfile,
  useGetMatchProfileQuery,
  useSendInterestMutation,
} from '@/store/services/matchApi.service';
import {
  useBlockUserMutation,
  useReportUserMutation,
} from '@/store/services/privacySettings.service';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import { matchDetailStyles } from './MatchDetail.styles';

type Props = {
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'MatchDetails'>;
  route: RouteProp<MatchesStackParamList, 'MatchDetails'>;
};

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

interface RowProps {
  label: string;
  value?: string | number | null;
  icon?: string;
  isLast?: boolean;
}

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600';
const HIDDEN = 'Visible after match/permission';
const EMPTY = '-';

const compact = (values: Array<string | number | undefined | null>): string =>
  values.filter(Boolean).join(', ') || EMPTY;

const getName = (profile?: DiscoveryProfile): string =>
  [profile?.personal?.firstName, profile?.personal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'MatchMate Member';

const getPhotos = (profile?: DiscoveryProfile): string[] => {
  const photos = profile?.images
    ?.filter((image) => image.isActive !== false)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((image) => resolveApiUrl(image.url))
    .filter((url): url is string => Boolean(url));
  return photos?.length ? photos : [FALLBACK_PHOTO];
};

const isOnline = (lastActiveAt?: string): boolean =>
  lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() <= 15 * 60 * 1000
    : false;

function Section({ title, icon, children }: SectionProps): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={theme.colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ label, value, icon, isLast }: RowProps): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowLeft}>
        {icon !== undefined && (
          <Feather name={icon} size={13} color={theme.colors.textMuted} />
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value ?? EMPTY}</Text>
    </View>
  );
}

export default function MatchDetailsScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);
  const { userId } = route.params;
  const { data, isLoading, refetch } = useGetMatchProfileQuery(userId);
  const [sendInterest, { isLoading: isSendingInterest }] =
    useSendInterestMutation();
  const [createDirectRoom, { isLoading: isOpeningChat }] =
    useCreateDirectRoomMutation();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [reportUser, { isLoading: isReporting }] = useReportUserMutation();

  const profile = data?.data ?? undefined;
  const name = getName(profile);
  const photos = useMemo(() => getPhotos(profile), [profile]);
  const canViewDetails = Boolean(profile?.privacy?.canViewPersonalDetails);
  const isMatched = Boolean(profile?.privacy?.isMatched);
  const online = isOnline(profile?.lastActiveAt);
  const location = compact([
    profile?.personal?.city,
    profile?.personal?.state,
    profile?.personal?.country,
  ]);

  const chips = [
    {
      icon: 'sun',
      label: formatEnumLabel(
        t,
        'options.religion',
        profile?.personal?.religion,
        HIDDEN
      ),
    },
    {
      icon: 'users',
      label: formatEnumLabel(
        t,
        'options.caste',
        profile?.personal?.caste,
        HIDDEN
      ),
    },
    {
      icon: 'trending-up',
      label: profile?.physical?.height
        ? cmToFeetInches(profile.physical.height) ||
          String(profile.physical.height)
        : HIDDEN,
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
  ];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    setActiveIndex(index);
  };

  const renderPhoto: ListRenderItem<string> = ({ item }) => (
    <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
  );

  const handlePrimaryAction = async (): Promise<void> => {
    if (isMatched) {
      try {
        await createDirectRoom({ targetUserId: userId }).unwrap();
        navigation.navigate('ChatDetails', {
          userId,
          partnerName: name,
          partnerPhoto: photos[0] ?? FALLBACK_PHOTO,
        });
      } catch {
        showError({
          title: 'Chat unavailable',
          message: 'Please try again later.',
        });
      }
      return;
    }

    try {
      await sendInterest({ receiverId: userId }).unwrap();
      showSuccess({
        title: 'Interest sent',
        message: `${name} will be notified.`,
      });
      await refetch();
    } catch {
      showError({
        title: 'Interest not sent',
        message: 'Please try again later.',
      });
    }
  };

  const handleReport = (): void => {
    showConfirm({
      title: 'Report profile?',
      message: `Report ${name} for review?`,
      confirmText: 'Report',
      destructive: true,
      onConfirm: () => {
        void reportUser({
          targetUserId: userId,
          reason: 'Reported from match details',
        })
          .unwrap()
          .then(() => {
            showSuccess({
              title: 'Report submitted',
              message: 'Thank you for helping keep MatchMate safe.',
            });
          })
          .catch(() => {
            showError({
              title: 'Unable to report',
              message: 'Please try again.',
            });
          });
      },
    });
  };

  const handleBlock = (): void => {
    showConfirm({
      title: 'Block profile?',
      message: `You will no longer see ${name}.`,
      confirmText: 'Block',
      destructive: true,
      onConfirm: () => {
        void blockUser({ targetUserId: userId })
          .unwrap()
          .then(() => {
            showSuccess({
              title: 'Profile blocked',
              message: `${name} has been blocked.`,
            });
            navigation.goBack();
          })
          .catch(() => {
            showError({
              title: 'Unable to block',
              message: 'Please try again.',
            });
          });
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>Loading profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Profile unavailable</Text>
          <Text style={styles.emptySubtitle}>
            This profile may be hidden or no longer available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            renderItem={renderPhoto}
            keyExtractor={(item, i) => `${item}-${i}`}
          />

          <View style={styles.carouselScrim} />
          <View style={styles.counterPill}>
            <Feather name="image" size={11} color={theme.colors.white} />
            <Text style={styles.counterText}>
              {activeIndex + 1} / {photos.length}
            </Text>
          </View>
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
          <View style={styles.heroOverlay}>
            {online && (
              <View style={styles.onlinePill}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlinePillText}>Online now</Text>
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

        <View style={styles.matchScoreBar}>
          <View style={styles.matchScoreLeft}>
            <View style={styles.matchScoreIconWrapper}>
              <Feather name="heart" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.matchScoreLabel}>Match Score</Text>
              <Text style={styles.matchScoreValue}>
                {profile.matchScore ?? profile.profileScore ?? 0}%
              </Text>
            </View>
          </View>
          <View style={styles.matchScoreDivider} />
          <View style={styles.matchScoreLeft}>
            <View style={styles.matchScoreIconWrapper}>
              <Feather name="shield" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.matchScoreLabel}>Details</Text>
              <Text style={styles.matchScoreValue}>
                {canViewDetails ? 'Open' : 'Limited'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chipsRow}>
          {chips.map((chip) => (
            <View key={`${chip.icon}-${chip.label}`} style={styles.chip}>
              <Feather
                name={chip.icon}
                size={12}
                color={theme.colors.primary}
              />
              <Text style={styles.chipText}>{chip.label}</Text>
            </View>
          ))}
        </View>

        <Section title="About Me" icon="user">
          <Text style={styles.aboutText}>
            {profile.personal?.aboutMe ??
              (canViewDetails ? 'No introduction added yet.' : HIDDEN)}
          </Text>
        </Section>

        <Section title="Basic Details" icon="info">
          <Row label="Name" value={name} icon="user" />
          <Row
            label="Age"
            value={profile.age ? `${profile.age} Years` : HIDDEN}
            icon="calendar"
          />
          <Row
            label="Height"
            value={
              profile.physical?.height
                ? cmToFeetInches(profile.physical.height) ||
                  String(profile.physical.height)
                : HIDDEN
            }
            icon="trending-up"
          />
          <Row
            label="Religion"
            value={formatEnumLabel(
              t,
              'options.religion',
              profile.personal?.religion,
              HIDDEN
            )}
            icon="sun"
          />
          <Row
            label="Caste"
            value={formatEnumLabel(
              t,
              'options.caste',
              profile.personal?.caste,
              HIDDEN
            )}
            icon="users"
            isLast
          />
        </Section>

        <Section title="Education & Career" icon="book">
          <Row
            label="Education"
            value={formatEnumLabel(
              t,
              'options.qualifications',
              profile.education?.qualification,
              HIDDEN
            )}
            icon="book"
          />
          <Row
            label="Profession"
            value={
              profile.education?.jobRole ??
              profile.education?.occupation ??
              HIDDEN
            }
            icon="briefcase"
          />
          <Row
            label="Company"
            value={profile.education?.companyName ?? HIDDEN}
            icon="briefcase"
          />
          <Row
            label="Annual Income"
            value={
              profile.privacy?.showIncome &&
              profile.education?.annualIncomeAmount
                ? String(profile.education.annualIncomeAmount)
                : HIDDEN
            }
            icon="dollar-sign"
            isLast
          />
        </Section>

        <Section title="Family Background" icon="home">
          <Row
            label="Family Type"
            value={formatEnumLabel(
              t,
              'options.family_types',
              profile.family?.familyType,
              HIDDEN
            )}
            icon="home"
          />
          <Row
            label="Family Status"
            value={formatEnumLabel(
              t,
              'options.family_status',
              profile.family?.familyStatus,
              HIDDEN
            )}
            icon="shield"
          />
          <Row
            label="Father's Occupation"
            value={profile.family?.fatherOccupation ?? HIDDEN}
            icon="briefcase"
            isLast
          />
        </Section>

        <Section title="Safety" icon="shield">
          <View style={styles.safetyActions}>
            <TouchableOpacity
              style={styles.safetyButton}
              onPress={handleReport}
              disabled={isReporting}
              accessibilityRole="button"
            >
              <Feather
                name="flag"
                size={15}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.safetyButtonText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.safetyButton, styles.safetyButtonDanger]}
              onPress={handleBlock}
              disabled={isBlocking}
              accessibilityRole="button"
            >
              <Feather name="slash" size={15} color={theme.colors.error} />
              <Text
                style={[styles.safetyButtonText, styles.safetyButtonTextDanger]}
              >
                Block
              </Text>
            </TouchableOpacity>
          </View>
        </Section>

        <View style={styles.footerSpacer} />
      </ScrollView>

      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.ctaOutline}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={16} color={theme.colors.primary} />
          <Text style={styles.ctaOutlineText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaPrimary}
          onPress={() => void handlePrimaryAction()}
          disabled={isSendingInterest || isOpeningChat}
          accessibilityRole="button"
        >
          <Feather
            name={isMatched ? 'message-circle' : 'heart'}
            size={16}
            color={theme.colors.white}
          />
          <Text style={styles.ctaPrimaryText}>
            {isMatched ? 'Chat' : 'Send Interest'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
