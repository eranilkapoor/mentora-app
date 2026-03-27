import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';

// ─── Constants ────────────────────────────────────────────────────────────────

const PINK = '#C2185B';
const PINK_LIGHT = '#FCE4EC';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  OnlineMatches: { userId: string };
  ChatScreen: { user: Match };
};

type Match = {
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
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
};

// ─── Mock API ─────────────────────────────────────────────────────────────────

const mockFetchMatches = async (): Promise<Match[]> => {
  await new Promise<void>((r) => setTimeout(r, 700));
  return [
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
      name: 'Anjali Verma',
      age: 26,
      height: '5\'2"',
      religion: 'Hindu',
      caste: 'Kayastha',
      education: 'MBA',
      profession: 'HR Manager',
      location: 'Delhi, India',
      avatarUrl: 'https://randomuser.me/api/portraits/women/66.jpg',
      isOnline: false,
      isNew: false,
    },
    {
      id: '3',
      name: 'Sneha Iyer',
      age: 27,
      height: '5\'3"',
      religion: 'Hindu',
      caste: 'Iyer',
      education: 'MBBS',
      profession: 'Doctor',
      location: 'Bengaluru, India',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      isOnline: true,
      isNew: false,
    },
  ];
};

// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
  item: Match;
  onViewProfile: () => void;
  onChat: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  item,
  onViewProfile,
  onChat,
}) => (
  <View style={styles.card}>
    {/* Photo */}
    <View style={styles.photoWrapper}>
      <Image source={{ uri: item.avatarUrl }} style={styles.photo} />

      {/* Gradient-like overlay at bottom of photo */}
      <View style={styles.photoOverlay} />

      {/* Badges */}
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

      {/* Name overlay on photo */}
      <View style={styles.nameOverlay}>
        <Text style={styles.nameOverlayText}>
          {item.name}, {item.age}
        </Text>
        <Text style={styles.locationOverlayText}>📍 {item.location}</Text>
      </View>
    </View>

    {/* Info section */}
    <View style={styles.info}>
      {/* Tags row */}
      <View style={styles.tagsRow}>
        {[item.height, item.religion, item.caste].map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Education & profession */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🎓</Text>
          <Text style={styles.metaText}>{item.education}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>💼</Text>
          <Text style={styles.metaText}>{item.profession}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={onViewProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onChat}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>💬 Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MatchListScreen: React.FC<Props> = ({ navigation }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    const data = await mockFetchMatches();
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem: ListRenderItem<Match> = ({ item }) => (
    <MatchCard
      item={item}
      onViewProfile={() =>
        navigation.navigate('OnlineMatches', { userId: item.id })
      }
      onChat={() => navigation.navigate('ChatScreen', { user: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Matches</Text>
          <Text style={styles.headerSub}>
            {matches.length > 0
              ? `${matches.length} profiles found for you`
              : 'Finding your matches…'}
          </Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>⚙ Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search by name…"
          placeholderTextColor="#AAA"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PINK} />
          <Text style={styles.loadingText}>Finding your matches…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>No matches found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different name or clear filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PINK]}
              tintColor={PINK}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#fff',
  },
  filterText: { fontSize: 13, color: '#555', fontWeight: '600' },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: { fontSize: 15, marginRight: 6, color: '#AAA' },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#1A1A1A' },

  listContent: { paddingHorizontal: 12, paddingBottom: 24, paddingTop: 4 },

  // Card
  card: {
    backgroundColor: '#fff',
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Photo
  photoWrapper: { position: 'relative' },
  photo: { width: '100%', height: 240 },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    // Simulated gradient from transparent to dark
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  newBadge: {
    backgroundColor: PINK,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#66BB6A',
  },
  onlineBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  nameOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  nameOverlayText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  locationOverlayText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Info
  info: { padding: 12 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: {
    backgroundColor: PINK_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 11, color: PINK, fontWeight: '600' },

  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 13 },
  metaText: { fontSize: 12, color: '#555', fontWeight: '500' },

  actions: { flexDirection: 'row', gap: 10 },
  outlineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PINK,
    alignItems: 'center',
  },
  outlineText: { color: PINK, fontWeight: '700', fontSize: 13 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PINK,
    alignItems: 'center',
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: '#888', marginTop: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySubtitle: { fontSize: 13, color: '#888' },
});

export default MatchListScreen;
