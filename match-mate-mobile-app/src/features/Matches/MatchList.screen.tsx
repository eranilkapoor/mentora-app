import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Header from '../../core/components/Header';
import { cmToFeetInches, formatEnumLabel } from '@/core/utils/format';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { resolveApiUrl } from '@/core/utils/config';
import { Caste } from '@/core/types';
import { MatchesStackParamList } from '@/navigation/types';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  DiscoveryProfile,
  InterestRecord,
  MatchRecord,
  MatchTab,
  useGetDiscoveryProfilesQuery,
  useGetMyMatchesQuery,
  useGetReceivedInterestsQuery,
  useGetSentInterestsQuery,
  useGetShortlistedProfilesQuery,
  useRemoveShortlistedProfileMutation,
  useRespondToInterestMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
  useWithdrawInterestMutation,
} from '@/store/services/matchApi.service';
import { matchListStyles } from './MatchList.styles';

type TabKey = MatchTab | 'matched' | 'requests' | 'shortlisted';

interface Match {
  id: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  caste: string;
  education: string;
  profession: string;
  location: string;
  avatarUrl: string;
  isOnline: boolean;
  isNew: boolean;
  isMatched: boolean;
  isShortlisted: boolean;
  isInterestPending: boolean;
  interestId?: string;
  requestStatus?: string;
}

interface TabConfig {
  key: TabKey;
  label: string;
  icon: string;
  count: number;
}

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600';
const FEED_PAGE_SIZE = 10;

type AgeRangeKey = 'any' | '18-25' | '26-32' | '33-40';
type CasteFilterKey = 'any' | Caste;

const AGE_FILTERS: Array<{
  key: AgeRangeKey;
  label: string;
  minAge?: number;
  maxAge?: number;
}> = [
  { key: 'any', label: 'Any age' },
  { key: '18-25', label: '18-25', minAge: 18, maxAge: 25 },
  { key: '26-32', label: '26-32', minAge: 26, maxAge: 32 },
  { key: '33-40', label: '33-40', minAge: 33, maxAge: 40 },
];

const CASTE_FILTERS: Array<{ key: CasteFilterKey; label: string }> = [
  { key: 'any', label: 'Any caste' },
  { key: 'general' as Caste, label: 'General' },
  { key: 'obc' as Caste, label: 'OBC' },
  { key: 'sc' as Caste, label: 'SC' },
];

const mergeByKey = <T,>(
  current: T[],
  next: T[],
  getKey: (item: T) => string
): T[] => {
  const byKey = new Map(current.map((item) => [getKey(item), item]));
  next.forEach((item) => byKey.set(getKey(item), item));
  return [...byKey.values()];
};

const isOnline = (lastActiveAt?: string): boolean =>
  lastActiveAt
    ? Date.now() - new Date(lastActiveAt).getTime() <= 15 * 60 * 1000
    : false;

const isNew = (createdAt?: string): boolean =>
  createdAt
    ? Date.now() - new Date(createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
    : false;

const getName = (profile: DiscoveryProfile): string =>
  [profile.personal?.firstName, profile.personal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'MatchMate Member';

const mapMatch = (
  profile: DiscoveryProfile,
  matchedIds: Set<string>,
  shortlistedIds: Set<string>,
  pendingInterestByUserId: Map<string, string>,
  t: (key: string, options: { defaultValue: string }) => string
): Match => {
  const pendingInterestId = pendingInterestByUserId.get(profile.userId);
  const photo = profile.images
    ?.filter((image) => image.isActive !== false)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((image) => resolveApiUrl(image.url))
    .find((url): url is string => Boolean(url));

  return {
    id: profile.userId,
    name: getName(profile),
    age: profile.age ?? 0,
    height: profile.physical?.height
      ? cmToFeetInches(profile.physical.height) ||
        String(profile.physical.height)
      : '-',
    religion: formatEnumLabel(
      t,
      'options.religion',
      profile.personal?.religion,
      '-'
    ),
    caste: formatEnumLabel(t, 'options.caste', profile.personal?.caste, '-'),
    education: formatEnumLabel(
      t,
      'options.qualifications',
      profile.education?.qualification,
      '-'
    ),
    profession:
      profile.education?.jobRole ?? profile.education?.occupation ?? '-',
    location:
      [profile.personal?.city, profile.personal?.state]
        .filter(Boolean)
        .join(', ') || '-',
    avatarUrl: photo ?? FALLBACK_PHOTO,
    isOnline: isOnline(profile.lastActiveAt),
    isNew: isNew(profile.createdAt),
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

function SkeletonCard(): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        <View style={[styles.skeletonLine, styles.skeletonLineXShort]} />
      </View>
    </View>
  );
}

const MatchCard = React.memo(function MatchCard({
  item,
  onViewProfile,
  onPrimaryAction,
  onShortlist,
  primaryLabel,
  primaryIcon,
  primaryState,
}: {
  item: Match;
  onViewProfile: () => void;
  onPrimaryAction: () => void;
  onShortlist: () => void;
  primaryLabel?: string;
  primaryIcon?: string;
  primaryState?: 'default' | 'pending' | 'success';
}): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.card}>
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: item.avatarUrl }}
          style={styles.photo}
          resizeMode="cover"
        />
        <View style={styles.photoScrim} />

        <View style={styles.badgeRow}>
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {item.isOnline && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineBadgeText}>Online</Text>
            </View>
          )}
        </View>

        <View style={styles.nameOverlay}>
          <Text style={styles.nameOverlayText} numberOfLines={1}>
            {item.name}, {item.age || '-'}
          </Text>
          <View style={styles.locationOverlayRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationOverlayText}>{item.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.tagsRow}>
          {[item.height, item.religion, item.caste].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="book" size={13} color={theme.colors.textMuted} />
            <Text style={styles.metaText}>{item.education}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather
              name="briefcase"
              size={13}
              color={theme.colors.textMuted}
            />
            <Text style={styles.metaText}>{item.profession}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={onViewProfile}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Feather name="user" size={14} color={theme.colors.primary} />
            <Text style={styles.outlineText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              primaryState === 'pending' && styles.primaryBtnPending,
              primaryState === 'success' && styles.primaryBtnSuccess,
            ]}
            onPress={onPrimaryAction}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Feather
              name={
                primaryIcon ?? (item.isMatched ? 'message-circle' : 'heart')
              }
              size={14}
              color={theme.colors.white}
            />
            <Text style={styles.primaryText}>
              {primaryLabel ?? (item.isMatched ? 'Chat' : 'Interest')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.shortlistBtn,
              item.isShortlisted && styles.shortlistBtnActive,
            ]}
            onPress={onShortlist}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              item.isShortlisted
                ? `Remove ${item.name} from shortlist`
                : `Shortlist ${item.name}`
            }
          >
            <Feather
              name="bookmark"
              size={16}
              color={
                item.isShortlisted ? theme.colors.white : theme.colors.accent
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default function MatchListScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<MatchesStackParamList, 'MatchList'>;
}): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState<AgeRangeKey>('any');
  const [casteFilter, setCasteFilter] = useState<CasteFilterKey>('any');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [discoveryProfiles, setDiscoveryProfiles] = useState<
    DiscoveryProfile[]
  >([]);
  const [acceptedMatchRecords, setAcceptedMatchRecords] = useState<
    MatchRecord[]
  >([]);
  const [shortlistedProfileRecords, setShortlistedProfileRecords] = useState<
    DiscoveryProfile[]
  >([]);
  const [receivedInterestRecords, setReceivedInterestRecords] = useState<
    InterestRecord[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('recommended');
  const selectedAgeFilter = useMemo(
    () => AGE_FILTERS.find((item) => item.key === ageFilter),
    [ageFilter]
  );
  const discoveryFilters = useMemo(
    () => ({
      ...(query.trim() ? { search: query.trim() } : {}),
      ...(cityFilter.trim() ? { city: cityFilter.trim() } : {}),
      ...(casteFilter === 'any' ? {} : { caste: casteFilter }),
      ...(selectedAgeFilter?.minAge
        ? { minAge: selectedAgeFilter.minAge }
        : {}),
      ...(selectedAgeFilter?.maxAge
        ? { maxAge: selectedAgeFilter.maxAge }
        : {}),
      ...(verifiedOnly ? { verifiedOnly } : {}),
    }),
    [casteFilter, cityFilter, query, selectedAgeFilter, verifiedOnly]
  );
  const activeFilterCount = useMemo(
    () =>
      [
        cityFilter.trim(),
        ageFilter !== 'any',
        casteFilter !== 'any',
        verifiedOnly,
      ].filter(Boolean).length,
    [ageFilter, casteFilter, cityFilter, verifiedOnly]
  );
  const { data, isLoading, isFetching, refetch } = useGetDiscoveryProfilesQuery(
    {
      type:
        activeTab === 'requests' ||
        activeTab === 'shortlisted' ||
        activeTab === 'matched'
          ? 'recommended'
          : activeTab,
      page,
      limit: FEED_PAGE_SIZE,
      radiusKm: 100,
      ...discoveryFilters,
    },
    {
      skip:
        activeTab === 'requests' ||
        activeTab === 'shortlisted' ||
        activeTab === 'matched',
    }
  );
  const {
    data: myMatches,
    isFetching: isFetchingMyMatches,
    isLoading: isLoadingMyMatches,
    refetch: refetchMyMatches,
  } = useGetMyMatchesQuery(
    { page, limit: FEED_PAGE_SIZE },
    { skip: activeTab !== 'matched' }
  );
  const {
    data: shortlistedProfiles,
    isLoading: isLoadingShortlisted,
    isFetching: isFetchingShortlisted,
    refetch: refetchShortlisted,
  } = useGetShortlistedProfilesQuery(
    { page, limit: FEED_PAGE_SIZE },
    { skip: activeTab !== 'shortlisted' }
  );
  const { data: shortlistedStatus, refetch: refetchShortlistedStatus } =
    useGetShortlistedProfilesQuery(
      { limit: 100 },
      { skip: activeTab === 'shortlisted' }
    );
  const { data: sentInterests, refetch: refetchSentInterests } =
    useGetSentInterestsQuery({ limit: 100 });
  const {
    data: receivedInterests,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
    refetch: refetchReceivedInterests,
  } = useGetReceivedInterestsQuery(
    { page, limit: FEED_PAGE_SIZE },
    { skip: activeTab !== 'requests' }
  );
  const [sendInterest] = useSendInterestMutation();
  const [shortlistProfile] = useShortlistProfileMutation();
  const [removeShortlistedProfile] = useRemoveShortlistedProfileMutation();
  const [respondToInterest] = useRespondToInterestMutation();
  const [withdrawInterest] = useWithdrawInterestMutation();
  const [createDirectRoom] = useCreateDirectRoomMutation();

  useEffect(() => {
    setPage(1);
    setDiscoveryProfiles([]);
    setAcceptedMatchRecords([]);
    setShortlistedProfileRecords([]);
    setReceivedInterestRecords([]);
  }, [activeTab, ageFilter, casteFilter, cityFilter, query, verifiedOnly]);

  useEffect(() => {
    if (
      !data?.data ||
      activeTab === 'matched' ||
      activeTab === 'shortlisted' ||
      activeTab === 'requests'
    ) {
      return;
    }

    setDiscoveryProfiles((current) =>
      page === 1
        ? data.data
        : mergeByKey(current, data.data, (profile) => profile.userId)
    );
  }, [activeTab, data, page]);

  useEffect(() => {
    if (!myMatches?.data || activeTab !== 'matched') return;

    setAcceptedMatchRecords((current) =>
      page === 1
        ? myMatches.data
        : mergeByKey(current, myMatches.data, (match) => match._id)
    );
  }, [activeTab, myMatches, page]);

  useEffect(() => {
    if (!shortlistedProfiles?.data || activeTab !== 'shortlisted') return;

    setShortlistedProfileRecords((current) =>
      page === 1
        ? shortlistedProfiles.data
        : mergeByKey(
            current,
            shortlistedProfiles.data,
            (profile) => profile.userId
          )
    );
  }, [activeTab, page, shortlistedProfiles]);

  useEffect(() => {
    if (!receivedInterests?.data || activeTab !== 'requests') return;

    setReceivedInterestRecords((current) =>
      page === 1
        ? receivedInterests.data
        : mergeByKey(
            current,
            receivedInterests.data,
            (interest) => interest._id
          )
    );
  }, [activeTab, page, receivedInterests]);

  const matchedIds = useMemo(() => {
    const ids = new Set<string>();
    myMatches?.data?.forEach((match) => {
      ids.add(String(match.userId));
      ids.add(String(match.targetUserId));
    });
    return ids;
  }, [myMatches]);

  const shortlistedIds = useMemo(
    () =>
      new Set(
        (activeTab === 'shortlisted'
          ? shortlistedProfileRecords
          : (shortlistedStatus?.data ?? [])
        ).map((profile) => profile.userId)
      ),
    [activeTab, shortlistedProfileRecords, shortlistedStatus]
  );

  const pendingInterestByUserId = useMemo(() => {
    const pending = new Map<string, string>();
    sentInterests?.data?.forEach((interest) => {
      if (interest.status === 'pending') {
        pending.set(String(interest.receiverId), interest._id);
      }
    });
    return pending;
  }, [sentInterests]);

  const matches = useMemo(
    () =>
      discoveryProfiles.map((profile) =>
        mapMatch(
          profile,
          matchedIds,
          shortlistedIds,
          pendingInterestByUserId,
          t
        )
      ),
    [discoveryProfiles, matchedIds, pendingInterestByUserId, shortlistedIds, t]
  );

  const shortlistedMatches = useMemo(
    () =>
      shortlistedProfileRecords.map((profile) =>
        mapMatch(
          profile,
          matchedIds,
          shortlistedIds,
          pendingInterestByUserId,
          t
        )
      ),
    [
      matchedIds,
      pendingInterestByUserId,
      shortlistedIds,
      shortlistedProfileRecords,
      t,
    ]
  );

  const acceptedMatches = useMemo(
    () =>
      acceptedMatchRecords
        .filter((match) => match.profile)
        .map((match) =>
          mapMatch(
            match.profile as DiscoveryProfile,
            matchedIds,
            shortlistedIds,
            pendingInterestByUserId,
            t
          )
        ),
    [
      acceptedMatchRecords,
      matchedIds,
      pendingInterestByUserId,
      shortlistedIds,
      t,
    ]
  );

  const requestMatches = useMemo(
    () =>
      receivedInterestRecords
        .filter((interest) => interest.status === 'pending' && interest.profile)
        .map((interest) => ({
          ...mapMatch(
            interest.profile as DiscoveryProfile,
            matchedIds,
            shortlistedIds,
            pendingInterestByUserId,
            t
          ),
          id: String(interest.senderId),
          interestId: interest._id,
          requestStatus: interest.status,
        })),
    [
      matchedIds,
      pendingInterestByUserId,
      receivedInterestRecords,
      shortlistedIds,
      t,
    ]
  );

  const visibleMatches =
    activeTab === 'requests'
      ? requestMatches
      : activeTab === 'shortlisted'
        ? shortlistedMatches
        : activeTab === 'matched'
          ? acceptedMatches
          : matches;

  const activeMeta =
    activeTab === 'requests'
      ? receivedInterests?.meta
      : activeTab === 'shortlisted'
        ? shortlistedProfiles?.meta
        : activeTab === 'matched'
          ? myMatches?.meta
          : data?.meta;

  const activeLoading =
    activeTab === 'requests'
      ? isLoadingRequests
      : activeTab === 'shortlisted'
        ? isLoadingShortlisted
        : activeTab === 'matched'
          ? isLoadingMyMatches
          : isLoading;

  const activeFetching =
    activeTab === 'requests'
      ? isFetchingRequests
      : activeTab === 'shortlisted'
        ? isFetchingShortlisted
        : activeTab === 'matched'
          ? isFetchingMyMatches
          : isFetching;

  const filtered = useMemo(() => {
    if (!query.trim()) return visibleMatches;
    const q = query.toLowerCase().trim();
    return visibleMatches.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.profession.toLowerCase().includes(q)
    );
  }, [query, visibleMatches]);

  const tabs: TabConfig[] = useMemo(
    () => [
      {
        key: 'recommended',
        label: 'Recommended',
        icon: 'star',
        count: activeTab === 'recommended' ? matches.length : 0,
      },
      {
        key: 'new',
        label: 'New',
        icon: 'zap',
        count: activeTab === 'new' ? matches.length : 0,
      },
      {
        key: 'online',
        label: 'Online',
        icon: 'wifi',
        count: activeTab === 'online' ? matches.length : 0,
      },
      {
        key: 'nearby',
        label: 'Nearby',
        icon: 'map-pin',
        count: activeTab === 'nearby' ? matches.length : 0,
      },
      {
        key: 'matched',
        label: 'Matched',
        icon: 'heart',
        count: acceptedMatches.length,
      },
      {
        key: 'shortlisted',
        label: 'Shortlisted',
        icon: 'bookmark',
        count: shortlistedMatches.length,
      },
      {
        key: 'requests',
        label: 'Requests',
        icon: 'inbox',
        count: requestMatches.length,
      },
    ],
    [
      activeTab,
      acceptedMatches.length,
      matches.length,
      requestMatches.length,
      shortlistedMatches.length,
    ]
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    setPage(1);

    const activeRefetch =
      activeTab === 'requests'
        ? refetchReceivedInterests
        : activeTab === 'shortlisted'
          ? refetchShortlisted
          : activeTab === 'matched'
            ? refetchMyMatches
            : refetch;

    try {
      await Promise.all([
        ...(page === 1 ? [activeRefetch()] : []),
        ...(activeTab === 'shortlisted' ? [] : [refetchShortlistedStatus()]),
        refetchSentInterests(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    activeTab,
    page,
    refetch,
    refetchMyMatches,
    refetchReceivedInterests,
    refetchSentInterests,
    refetchShortlisted,
    refetchShortlistedStatus,
  ]);

  const loadMore = useCallback(() => {
    if (activeFetching || !activeMeta?.hasNextPage) {
      return;
    }

    setPage((current) => current + 1);
  }, [activeFetching, activeMeta?.hasNextPage]);

  const handlePrimaryAction = useCallback(
    async (item: Match): Promise<void> => {
      if (item.interestId) {
        try {
          await respondToInterest({
            interestId: item.interestId,
            action: 'ACCEPT',
          }).unwrap();
          Alert.alert(
            'Interest accepted',
            `You can now chat with ${item.name}.`
          );
        } catch {
          Alert.alert('Request not updated', 'Please try again later.');
        }
        return;
      }

      if (!item.isMatched) {
        if (item.isInterestPending && item.interestId) {
          try {
            await withdrawInterest({ interestId: item.interestId }).unwrap();
          } catch {
            Alert.alert('Interest not withdrawn', 'Please try again later.');
          }
          return;
        }

        try {
          await sendInterest({ receiverId: item.id }).unwrap();
          Alert.alert('Interest sent', `${item.name} will be notified.`);
        } catch {
          Alert.alert('Interest not sent', 'Please try again later.');
        }
        return;
      }

      try {
        await createDirectRoom({ targetUserId: item.id }).unwrap();
        navigation.navigate('ChatDetails', {
          userId: item.id,
          partnerName: item.name,
          partnerPhoto: item.avatarUrl,
        });
      } catch {
        Alert.alert(
          'Chat unavailable',
          'You can chat after both users have accepted the match.'
        );
      }
    },
    [
      createDirectRoom,
      navigation,
      respondToInterest,
      sendInterest,
      withdrawInterest,
    ]
  );

  const handleShortlist = useCallback(
    async (item: Match): Promise<void> => {
      try {
        if (item.isShortlisted) {
          await removeShortlistedProfile({ userId: item.id }).unwrap();
          return;
        }

        await shortlistProfile({ userId: item.id }).unwrap();
      } catch {
        Alert.alert('Shortlist not updated', 'Please try again later.');
      }
    },
    [removeShortlistedProfile, shortlistProfile]
  );

  const renderItem = useCallback(
    ({ item }: { item: Match }) => (
      <MatchCard
        item={item}
        onViewProfile={() =>
          navigation.navigate('MatchDetails', { userId: item.id })
        }
        onPrimaryAction={() => {
          void handlePrimaryAction(item);
        }}
        onShortlist={() => {
          void handleShortlist(item);
        }}
        primaryLabel={
          item.requestStatus
            ? 'Accept'
            : item.isMatched
              ? 'Chat'
              : item.isInterestPending
                ? 'Withdraw'
                : 'Interest'
        }
        primaryIcon={
          item.requestStatus
            ? 'check'
            : item.isMatched
              ? 'message-circle'
              : item.isInterestPending
                ? 'x-circle'
                : 'heart'
        }
        primaryState={
          item.isMatched
            ? 'success'
            : item.isInterestPending
              ? 'pending'
              : 'default'
        }
      />
    ),
    [handlePrimaryAction, handleShortlist, navigation]
  );

  const clearFilters = useCallback(() => {
    setCityFilter('');
    setAgeFilter('any');
    setCasteFilter('any');
    setVerifiedOnly(false);
  }, []);

  const ListHeader = useCallback(
    () => (
      <View style={styles.searchWrapper}>
        <View style={styles.searchHeaderRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Search name, city, profession"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                accessibilityRole="button"
              >
                <Feather name="x" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterToggle,
              showFilters && styles.filterToggleActive,
            ]}
            onPress={() => setShowFilters((current) => !current)}
            accessibilityRole="button"
          >
            <Feather
              name="sliders"
              size={16}
              color={showFilters ? theme.colors.white : theme.colors.primary}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.resultsBarCompact}>
          <Text style={styles.resultsText}>
            <Text style={styles.resultsHighlight}>{filtered.length}</Text>{' '}
            profiles found
          </Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={clearFilters} accessibilityRole="button">
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterPanelHeader}>
              <Text style={styles.filterPanelTitle}>Discovery filters</Text>
              <Text style={styles.filterPanelSubtitle}>
                Refine profiles without changing your saved preferences.
              </Text>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>City</Text>
              <View style={styles.filterInputBox}>
                <Feather
                  name="map-pin"
                  size={16}
                  color={theme.colors.textMuted}
                />
                <TextInput
                  placeholder="Search city"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.searchInput}
                  value={cityFilter}
                  onChangeText={setCityFilter}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {cityFilter.length > 0 && (
                  <TouchableOpacity onPress={() => setCityFilter('')}>
                    <Feather
                      name="x"
                      size={16}
                      color={theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Age range</Text>
              <View style={styles.filterChipRow}>
                {AGE_FILTERS.map((item) => {
                  const selected = ageFilter === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipActive,
                      ]}
                      onPress={() => setAgeFilter(item.key)}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selected && styles.filterChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Caste</Text>
              <View style={styles.filterChipRow}>
                {CASTE_FILTERS.map((item) => {
                  const selected = casteFilter === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipActive,
                      ]}
                      onPress={() => setCasteFilter(item.key)}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selected && styles.filterChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.verifiedToggle,
                verifiedOnly && styles.verifiedToggleActive,
              ]}
              onPress={() => setVerifiedOnly((current) => !current)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: verifiedOnly }}
            >
              <Feather
                name={verifiedOnly ? 'check-circle' : 'circle'}
                size={16}
                color={
                  verifiedOnly ? theme.colors.white : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.verifiedToggleText,
                  verifiedOnly && styles.verifiedToggleTextActive,
                ]}
              >
                Verified profiles only
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [
      activeFilterCount,
      ageFilter,
      casteFilter,
      cityFilter,
      clearFilters,
      filtered.length,
      query,
      showFilters,
      styles,
      theme.colors.primary,
      theme.colors.textMuted,
      theme.colors.textSecondary,
      theme.colors.white,
      verifiedOnly,
    ]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Matches"
        subtitle="Recommended, new, online and nearby profiles"
        actions={[
          {
            icon: 'filter',
            badge: activeFilterCount > 0,
            onPress: () => setShowFilters((current) => !current),
          },
        ]}
      />

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, selected && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
              >
                <Feather
                  name={tab.icon}
                  size={13}
                  color={
                    selected ? theme.colors.white : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[styles.tabText, selected && styles.tabTextActive]}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={[styles.tabBadge, selected && styles.tabBadgeActive]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        selected && styles.tabBadgeTextActive,
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {activeLoading ? (
        <>
          <ListHeader />
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Feather name="search" size={36} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {query ? 'No results found' : 'No profiles yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {query
                  ? 'Try different keywords.'
                  : 'Update preferences or check another tab.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            activeFetching && page > 1 ? (
              <View style={styles.listFooter}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || activeFetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </SafeAreaView>
  );
}
