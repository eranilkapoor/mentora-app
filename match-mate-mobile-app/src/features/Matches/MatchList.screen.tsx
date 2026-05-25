import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { MatchesStackParamList } from '@/navigation/types';
import { useCreateDirectRoomMutation } from '@/store/services/chatApi.service';
import {
  DiscoveryProfile,
  MatchTab,
  useGetDiscoveryProfilesQuery,
  useGetMyMatchesQuery,
  useGetReceivedInterestsQuery,
  useGetShortlistedProfilesQuery,
  useRemoveShortlistedProfileMutation,
  useRespondToInterestMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
} from '@/store/services/matchApi.service';
import { matchListStyles } from './MatchList.styles';

type TabKey = MatchTab | 'requests' | 'shortlisted';

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
  t: (key: string, options: { defaultValue: string }) => string
): Match => {
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
    isMatched: matchedIds.has(profile.userId),
    isShortlisted:
      profile.isShortlisted === true || shortlistedIds.has(profile.userId),
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
}: {
  item: Match;
  onViewProfile: () => void;
  onPrimaryAction: () => void;
  onShortlist: () => void;
  primaryLabel?: string;
  primaryIcon?: string;
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
            style={styles.primaryBtn}
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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('recommended');
  const { data, isLoading, isFetching, refetch } = useGetDiscoveryProfilesQuery(
    {
      type:
        activeTab === 'requests' || activeTab === 'shortlisted'
          ? 'recommended'
          : activeTab,
      limit: 30,
      radiusKm: 100,
    },
    { skip: activeTab === 'requests' || activeTab === 'shortlisted' }
  );
  const { data: myMatches, refetch: refetchMyMatches } = useGetMyMatchesQuery();
  const {
    data: shortlistedProfiles,
    isLoading: isLoadingShortlisted,
    isFetching: isFetchingShortlisted,
    refetch: refetchShortlisted,
  } = useGetShortlistedProfilesQuery({ limit: 100 });
  const {
    data: receivedInterests,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
    refetch: refetchReceivedInterests,
  } = useGetReceivedInterestsQuery(
    { limit: 30 },
    { skip: activeTab !== 'requests' }
  );
  const [sendInterest] = useSendInterestMutation();
  const [shortlistProfile] = useShortlistProfileMutation();
  const [removeShortlistedProfile] = useRemoveShortlistedProfileMutation();
  const [respondToInterest] = useRespondToInterestMutation();
  const [createDirectRoom] = useCreateDirectRoomMutation();

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
        (shortlistedProfiles?.data ?? []).map((profile) => profile.userId)
      ),
    [shortlistedProfiles]
  );

  const matches = useMemo(
    () =>
      (data?.data ?? []).map((profile) =>
        mapMatch(profile, matchedIds, shortlistedIds, t)
      ),
    [data, matchedIds, shortlistedIds, t]
  );

  const shortlistedMatches = useMemo(
    () =>
      (shortlistedProfiles?.data ?? []).map((profile) =>
        mapMatch(profile, matchedIds, shortlistedIds, t)
      ),
    [matchedIds, shortlistedIds, shortlistedProfiles, t]
  );

  const requestMatches = useMemo(
    () =>
      (receivedInterests?.data ?? [])
        .filter((interest) => interest.status === 'PENDING' && interest.profile)
        .map((interest) => ({
          ...mapMatch(
            interest.profile as DiscoveryProfile,
            matchedIds,
            shortlistedIds,
            t
          ),
          id: String(interest.senderId),
          interestId: interest._id,
          requestStatus: interest.status,
        })),
    [matchedIds, receivedInterests, shortlistedIds, t]
  );

  const visibleMatches =
    activeTab === 'requests'
      ? requestMatches
      : activeTab === 'shortlisted'
        ? shortlistedMatches
        : matches;

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
      matches.length,
      requestMatches.length,
      shortlistedMatches.length,
    ]
  );

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([
      activeTab === 'requests' ? refetchReceivedInterests() : refetch(),
      refetchShortlisted(),
      refetchMyMatches(),
    ]);
    setRefreshing(false);
  }, [
    activeTab,
    refetch,
    refetchMyMatches,
    refetchReceivedInterests,
    refetchShortlisted,
  ]);

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
    [createDirectRoom, navigation, respondToInterest, sendInterest]
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
          item.interestId ? 'Accept' : item.isMatched ? 'Chat' : 'Interest'
        }
        primaryIcon={
          item.interestId
            ? 'check'
            : item.isMatched
              ? 'message-circle'
              : 'heart'
        }
      />
    ),
    [handlePrimaryAction, handleShortlist, navigation]
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            placeholder="Search by name, location, profession..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [query, styles, theme.colors.textMuted]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Matches"
        subtitle="Recommended, new, online and nearby profiles"
        enableSearch
        searchPlaceholder="Search by name, city..."
        actions={[{ icon: 'filter', onPress: () => {} }]}
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

      {(
        activeTab === 'requests'
          ? isLoadingRequests
          : activeTab === 'shortlisted'
            ? isLoadingShortlisted
            : isLoading
      ) ? (
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing ||
                (activeTab === 'requests'
                  ? isFetchingRequests
                  : activeTab === 'shortlisted'
                    ? isFetchingShortlisted
                    : isFetching)
              }
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
