import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
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
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from './MatchListScreen.styles';

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
  ({ item, onViewProfile, onChat }) => {
    const styles = useThemedStyles(matchListStyles);

    return (
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
    );
  }
);

MatchCard.displayName = 'MatchCard';

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ query: string }> = ({ query }) => {
  const styles = useThemedStyles(matchListStyles);

  return (
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
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MatchListScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(matchListStyles);

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
    [query, loading, filteredMatches.length, handleFilter, styles]
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
