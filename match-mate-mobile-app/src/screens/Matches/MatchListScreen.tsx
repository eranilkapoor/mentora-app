import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../core/constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  OnlineMatches: { userId: string };
  ChatScreen: { user: Match };
};

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

interface MatchCardProps {
  item: Match;
  onViewProfile: () => void;
  onChat: () => void;
}

interface Props {
  navigation: NavigationProp<RootStackParamList>;
}

// ─── Mock API ─────────────────────────────────────────────────────────────────

const mockFetchMatches = async (): Promise<Match[]> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 700));
  return [
    {
      id: '1',
      name: 'Priya Sharma',
      age: 28,
      height: `5'4"`,
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
      height: `5'5"`,
      religion: 'Hindu',
      caste: 'Reddy',
      education: 'MBA',
      profession: 'Business Analyst',
      location: 'Hyderabad, India',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      isOnline: false,
      isNew: false,
    },
    {
      id: '3',
      name: 'Meera Patel',
      age: 27,
      height: `5'3"`,
      religion: 'Hindu',
      caste: 'Patel',
      education: 'B.Sc',
      profession: 'Teacher',
      location: 'Ahmedabad, India',
      avatarUrl: 'https://randomuser.me/api/portraits/women/72.jpg',
      isOnline: true,
      isNew: false,
    },
  ];
};

// ─── Card Component ───────────────────────────────────────────────────────────

const MatchCard = React.memo<MatchCardProps>(
  ({ item, onViewProfile, onChat }) => (
    <View style={styles.card}>
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: item.avatarUrl }}
          style={styles.photo}
          resizeMode="cover"
        />

        <View style={styles.photoOverlay} />

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
            {item.name}, {item.age}
          </Text>
          <Text style={styles.locationOverlayText} numberOfLines={1}>
            📍 {item.location}
          </Text>
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
          <Text style={styles.metaText} numberOfLines={1}>
            🎓 {item.education}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            💼 {item.profession}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={onViewProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.outlineText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onChat}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryText}>💬 Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
);

MatchCard.displayName = 'MatchCard';

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ query: string }> = ({ query }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>🔍</Text>
    <Text style={styles.emptyTitle}>
      {query ? 'No matches found' : 'No matches yet'}
    </Text>
    <Text style={styles.emptySubtitle}>
      {query
        ? 'Try adjusting your search or filters'
        : 'New matches will appear here'}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MatchListScreen: React.FC<Props> = ({ navigation }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockFetchMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await mockFetchMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to refresh matches:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const filteredMatches = useMemo(() => {
    if (!query.trim()) {
      return matches;
    }

    const searchTerm = query.toLowerCase().trim();
    return matches.filter(
      (match) =>
        match.name.toLowerCase().includes(searchTerm) ||
        match.location.toLowerCase().includes(searchTerm) ||
        match.profession.toLowerCase().includes(searchTerm)
    );
  }, [matches, query]);

  const handleViewProfile = useCallback(
    (userId: string) => {
      navigation.navigate('OnlineMatches', { userId });
    },
    [navigation]
  );

  const handleChat = useCallback(
    (user: Match) => {
      navigation.navigate('ChatScreen', { user });
    },
    [navigation]
  );

  const handleFilter = useCallback(() => {
    // TODO: Navigate to filter screen or show filter modal
    // console.log('Open filters');
  }, []);

  const keyExtractor = useCallback((item: Match) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Match }) => (
      <MatchCard
        item={item}
        onViewProfile={() => handleViewProfile(item.id)}
        onChat={() => handleChat(item)}
      />
    ),
    [handleViewProfile, handleChat]
  );

  const renderListHeader = useCallback(
    () => (
      <>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Matches</Text>
          <TouchableOpacity onPress={handleFilter} activeOpacity={0.7}>
            <Text style={styles.filterText}>⚙ Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search by name, location, profession..."
            placeholderTextColor={Colors.textMuted}
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
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results count */}
        {!loading && (
          <View style={styles.resultsCount}>
            <Text style={styles.resultsText}>
              {filteredMatches.length}{' '}
              {filteredMatches.length === 1 ? 'match' : 'matches'}
              {query && ' found'}
            </Text>
          </View>
        )}
      </>
    ),
    [query, loading, filteredMatches.length, handleFilter]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding your matches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={<EmptyState query={query} />}
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
};

export default MatchListScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  filterText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  searchBox: {
    margin: 12,
    marginBottom: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.05)`,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearText: {
    color: Colors.textMuted,
    fontSize: 18,
    fontWeight: '600',
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.01)`,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  photo: {
    width: '100%',
    height: 280,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    height: 120,
    width: '100%',
    backgroundColor: Colors.black,
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  newBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  nameOverlayText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  locationOverlayText: {
    color: Colors.white,
    fontSize: 13,
    opacity: 0.9,
  },
  info: {
    padding: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 12,
    marginBottom: 14,
    gap: 6,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
