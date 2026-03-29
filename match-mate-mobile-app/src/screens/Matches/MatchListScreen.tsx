import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../core/constants/colors';

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
  ];
};

// ─── Card ─────────────────────────────────────────────────────────────────────

const MatchCard = ({ item, onViewProfile, onChat }: any) => (
  <View style={styles.card}>
    <View style={styles.photoWrapper}>
      <Image source={{ uri: item.avatarUrl }} style={styles.photo} />

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
        <Text style={styles.nameOverlayText}>
          {item.name}, {item.age}
        </Text>
        <Text style={styles.locationOverlayText}>📍 {item.location}</Text>
      </View>
    </View>

    <View style={styles.info}>
      <View style={styles.tagsRow}>
        {[item.height, item.religion, item.caste].map((tag: string) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>🎓 {item.education}</Text>
        <Text style={styles.metaText}>💼 {item.profession}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.outlineBtn} onPress={onViewProfile}>
          <Text style={styles.outlineText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={onChat}>
          <Text style={styles.primaryText}>💬 Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

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

  const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <TouchableOpacity>
          <Text style={styles.filterText}>⚙ Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search..."
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <MatchCard
              item={item}
              onViewProfile={() =>
                navigation.navigate('OnlineMatches', { userId: item.id })
              }
              onChat={() => navigation.navigate('ChatScreen', { user: item })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default MatchListScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPage },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  filterText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  searchBox: {
    margin: 12,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
  },
  searchInput: {
    height: 40,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: 240 },
  photoWrapper: { position: 'relative' },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    height: 100,
    width: '100%',
    backgroundColor: Colors.overlayDark,
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  newBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  onlineBadge: {
    flexDirection: 'row',
    backgroundColor: Colors.overlayDark,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  onlineBadgeText: {
    color: Colors.white,
    fontSize: 10,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  nameOverlayText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  locationOverlayText: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.8,
  },
  info: { padding: 12 },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 11,
  },
  metaRow: {
    marginVertical: 10,
    gap: 6,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  primaryText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
