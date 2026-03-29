import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../core/constants/colors';

// ─── Constants ────────────────────────────────────────────────────────────────

const RED = '#D32F2F';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  Chat: { partnerId: string; partnerName: string };
  ProfileDetail: { userId: string };
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
};

type OnlineMatch = {
  id: string;
  name: string;
  age: number;
  height: string;
  education: string;
  profession: string;
  city: string;
  photo: string;
  isOnline: boolean;
  isNew?: boolean;
};

interface MatchCardProps {
  item: OnlineMatch;
  onChat: () => void;
  onViewProfile: () => void;
}

// ─── Mock API ─────────────────────────────────────────────────────────────────

const mockFetchOnlineMatches = (): Promise<OnlineMatch[]> =>
  new Promise<OnlineMatch[]>((resolve) =>
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Priya Sharma',
          age: 27,
          height: '5\'4"',
          education: 'MBA',
          profession: 'HR Manager',
          city: 'Delhi',
          photo: 'https://i.pravatar.cc/300?img=11',
          isOnline: true,
          isNew: true,
        },
        {
          id: '2',
          name: 'Ankit Verma',
          age: 30,
          height: '5\'9"',
          education: 'B.Tech',
          profession: 'Software Engineer',
          city: 'Bangalore',
          photo: 'https://i.pravatar.cc/300?img=12',
          isOnline: true,
          isNew: false,
        },
        {
          id: '3',
          name: 'Meera Nair',
          age: 25,
          height: '5\'2"',
          education: 'B.Com',
          profession: 'Chartered Accountant',
          city: 'Kochi',
          photo: 'https://i.pravatar.cc/300?img=47',
          isOnline: false,
          isNew: true,
        },
      ]);
    }, 600)
  );

// ─── Match Card ───────────────────────────────────────────────────────────────

const MatchCard: React.FC<MatchCardProps> = ({
  item,
  onChat,
  onViewProfile,
}) => (
  <View style={styles.card}>
    {/* Photo */}
    <View style={styles.photoWrapper}>
      <Image source={{ uri: item.photo }} style={styles.image} />
      <View style={styles.photoScrim} />

      {/* Top badges */}
      <View style={styles.badgeRow}>
        {item.isOnline && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>Online now</Text>
          </View>
        )}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>

      {/* Name overlay */}
      <View style={styles.nameOverlay}>
        <Text style={styles.nameOverlayText}>
          {item.name}, {item.age}
        </Text>
        <Text style={styles.cityOverlayText}>📍 {item.city}</Text>
      </View>
    </View>

    {/* Info */}
    <View style={styles.info}>
      <View style={styles.tagsRow}>
        {[item.height, item.education, item.profession].map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={onChat}
          activeOpacity={0.85}
        >
          <Text style={styles.chatText}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={onViewProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.profileText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnlineMatchesScreen({ navigation }: Props) {
  const [matches, setMatches] = useState<OnlineMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    const data = await mockFetchOnlineMatches();
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onlineCount = matches.filter((m) => m.isOnline).length;

  const renderItem: ListRenderItem<OnlineMatch> = ({ item }) => (
    <MatchCard
      item={item}
      onChat={() =>
        navigation.navigate('Chat', {
          partnerId: item.id,
          partnerName: item.name,
        })
      }
      onViewProfile={() =>
        navigation.navigate('ProfileDetail', { userId: item.id })
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Online Matches</Text>
          {!loading && (
            <Text style={styles.headerSub}>
              <Text style={styles.onlineCountText}>{onlineCount} online</Text> ·{' '}
              {matches.length} total profiles
            </Text>
          )}
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={styles.loadingText}>Finding who's online…</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🕊️</Text>
          <Text style={styles.emptyTitle}>No one online right now</Text>
          <Text style={styles.emptySub}>Check back in a bit!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  onlineCountText: { color: Colors.primary, fontWeight: '700' },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },

  listContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },

  // Card
  card: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Photo
  photoWrapper: { position: 'relative' },
  image: { width: '100%', height: 230 },
  photoScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: Colors.overlayDark,
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.overlayDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  newBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  nameOverlayText: { fontSize: 20, fontWeight: '800', color: Colors.white },
  cityOverlayText: {
    fontSize: 12,
    color: Colors.white,
    marginTop: 2,
  },

  // Info
  info: { padding: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },

  // Actions
  actions: { flexDirection: 'row', gap: 10 },
  chatBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  chatText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  profileBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  profileText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: Colors.textMuted, marginTop: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textMuted },
});
