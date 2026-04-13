import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from './MatchListScreen.styles';
import Header from '../../core/components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  MatchDetail: { userId: string };
  ChatsDetail: { userId: string; partnerName: string; partnerPhoto: string };
};

type TabKey = 'recommended' | 'new' | 'online';

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
  isOnline?: boolean;
  isNew?: boolean;
}

interface TabConfig {
  key: TabKey;
  label: string;
  icon: string;
  count: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ALL_MATCHES: Match[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    age: 28,
    height: '5\'4"',
    religion: 'Hindu',
    caste: 'Brahmin',
    education: 'B.Tech',
    profession: 'Software Engineer',
    location: 'Mumbai, India',
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    isOnline: true,
    isNew: true,
  },
  {
    id: '2',
    name: 'Ananya Reddy',
    age: 26,
    height: '5\'5"',
    religion: 'Hindu',
    caste: 'Reddy',
    education: 'MBA',
    profession: 'Business Analyst',
    location: 'Hyderabad, India',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    isOnline: false,
    isNew: true,
  },
  {
    id: '3',
    name: 'Meera Patel',
    age: 27,
    height: '5\'3"',
    religion: 'Hindu',
    caste: 'Patel',
    education: 'B.Sc',
    profession: 'Teacher',
    location: 'Ahmedabad, India',
    avatarUrl: 'https://randomuser.me/api/portraits/women/72.jpg',
    isOnline: true,
    isNew: false,
  },
  {
    id: '4',
    name: 'Kavya Nair',
    age: 25,
    height: '5\'2"',
    religion: 'Hindu',
    caste: 'Nair',
    education: 'B.Com',
    profession: 'CA',
    location: 'Kochi, Kerala',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    isOnline: true,
    isNew: false,
  },
];

const mockFetchMatches = async (): Promise<Match[]> => {
  await new Promise<void>((r) => setTimeout(r, 700));
  return ALL_MATCHES;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard = React.memo(function MatchCard({
  item,
  onViewProfile,
  onChat,
}: {
  item: Match;
  onViewProfile: () => void;
  onChat: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);

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
          {item.isNew === true && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {item.isOnline === true && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineBadgeText}>Online</Text>
            </View>
          )}
        </View>

        <View style={styles.nameOverlay}>
          <Text style={styles.nameOverlayText} numberOfLines={1}>
            {item.name}, {item.age}
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
            <Feather name="book" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{item.education}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="briefcase" size={13} color={Colors.textMuted} />
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
            <Feather name="user" size={14} color={Colors.primary} />
            <Text style={styles.outlineText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onChat}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Feather name="message-circle" size={14} color={Colors.white} />
            <Text style={styles.primaryText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function MatchListScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const [matches, setMatches] = useState<Match[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('recommended');

  const loadMatches = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await mockFetchMatches();
      setMatches(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async (): Promise<void> => {
    try {
      setRefreshing(true);
      const data = await mockFetchMatches();
      setMatches(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  // Tab filter
  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return matches.filter((m) => m.isNew);
      case 'online':
        return matches.filter((m) => m.isOnline);
      default:
        return matches;
    }
  }, [matches, activeTab]);

  // Search filter
  const filtered = useMemo(() => {
    if (!query.trim()) return tabFiltered;
    const q = query.toLowerCase().trim();
    return tabFiltered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.profession.toLowerCase().includes(q)
    );
  }, [tabFiltered, query]);

  const TABS: TabConfig[] = useMemo(
    () => [
      {
        key: 'recommended',
        label: 'Recommended',
        icon: 'star',
        count: matches.length,
      },
      {
        key: 'new',
        label: 'New',
        icon: 'zap',
        count: matches.filter((m) => m.isNew).length,
      },
      {
        key: 'online',
        label: 'Online',
        icon: 'wifi',
        count: matches.filter((m) => m.isOnline).length,
      },
    ],
    [matches]
  );

  const renderItem = useCallback(
    ({ item }: { item: Match }) => (
      <MatchCard
        item={item}
        onViewProfile={() =>
          navigation.navigate('MatchDetail', { userId: item.id })
        }
        onChat={() =>
          navigation.navigate('ChatsDetail', {
            userId: item.id,
            partnerName: item.name,
            partnerPhoto: item.avatarUrl,
          })
        }
      />
    ),
    [navigation]
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            placeholder="Search by name, location, profession…"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [query, styles]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Shared Header ────────────────────────────────────────── */}
      <Header
        onFilter={() => {}}
        onNotifications={() => navigation.navigate('Notifications' as never)}
        hasUnread
      />

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Feather
                  name={t.icon}
                  size={13}
                  color={isActive ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {t.label}
                </Text>
                {t.count > 0 && (
                  <View
                    style={[styles.tabBadge, isActive && styles.tabBadgeActive]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        isActive && styles.tabBadgeTextActive,
                      ]}
                    >
                      {t.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ──────────────────────────────────────────────── */}
      {loading ? (
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
                <Feather name="search" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {query ? 'No results found' : 'No matches yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {query
                  ? `Try different keywords`
                  : 'Check back soon for new matches.'}
              </Text>
              {query.length === 0 && (
                <TouchableOpacity style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Update Preferences</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
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
