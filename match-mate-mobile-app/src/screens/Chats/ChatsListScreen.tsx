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

const RED = '#D32F2F';
const RED_LIGHT = '#FDECEA';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  ChatScreen: { userId: string };
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
};

type ChatMatch = {
  id: string;
  name: string;
  age: number;
  city: string;
  lastMessage: string;
  avatarUrl: string;
  matchedAt: string;
  isOnline: boolean;
  unreadCount: number;
};

interface ChatRowProps {
  item: ChatMatch;
  onPress: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── Mock API ─────────────────────────────────────────────────────────────────

const mockFetchMatches = async (): Promise<ChatMatch[]> => {
  await new Promise<void>((r) => setTimeout(r, 700));
  return [
    {
      id: '1',
      name: 'Priya Sharma',
      age: 28,
      city: 'Mumbai',
      lastMessage: 'Hi, how are you?',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
      matchedAt: new Date().toISOString(),
      isOnline: true,
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Ankit Verma',
      age: 31,
      city: 'Delhi',
      lastMessage: 'Thanks for accepting!',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      matchedAt: new Date(Date.now() - 3600000).toISOString(),
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '3',
      name: 'Sneha Iyer',
      age: 26,
      city: 'Bengaluru',
      lastMessage: 'Looking forward to talking!',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      matchedAt: new Date(Date.now() - 7200000).toISOString(),
      isOnline: true,
      unreadCount: 5,
    },
  ];
};

// ─── Chat Row ─────────────────────────────────────────────────────────────────

const ChatRow: React.FC<ChatRowProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.card, item.unreadCount > 0 && styles.cardUnread]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {/* Avatar */}
    <View style={styles.avatarWrap}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      {item.isOnline && <View style={styles.onlineDot} />}
    </View>

    {/* Info */}
    <View style={styles.info}>
      <View style={styles.topRow}>
        <Text style={[styles.name, item.unreadCount > 0 && styles.nameUnread]}>
          {item.name}, {item.age}
        </Text>
        <Text style={styles.time}>{formatTime(item.matchedAt)}</Text>
      </View>

      <Text style={styles.city}>📍 {item.city}</Text>

      <View style={styles.bottomRow}>
        <Text
          style={[
            styles.lastMessage,
            item.unreadCount > 0 && styles.lastMessageUnread,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage || 'Start a conversation…'}
        </Text>
        {item.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const [matches, setMatches] = useState<ChatMatch[]>([]);
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

  const totalUnread = matches.reduce((sum, m) => sum + m.unreadCount, 0);

  const renderItem: ListRenderItem<ChatMatch> = ({ item }) => (
    <ChatRow
      item={item}
      onPress={() => navigation.navigate('ChatScreen', { userId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          {!loading && (
            <Text style={styles.headerSub}>
              {totalUnread > 0
                ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`
                : `${matches.length} conversations`}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>⚙ Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search conversations…"
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
          <ActivityIndicator size="large" color={RED} />
          <Text style={styles.loadingText}>Loading conversations…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💌</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySub}>Start chatting with your matches!</Text>
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
              colors={[RED]}
              tintColor={RED}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatListScreen;

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
  searchIcon: { fontSize: 15, marginRight: 6 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#1A1A1A' },

  listContent: { paddingBottom: 24 },

  // Card
  card: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardUnread: { backgroundColor: RED_LIGHT },

  // Avatar
  avatarWrap: { marginRight: 12, position: 'relative' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#EEE',
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#66BB6A',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Info
  info: { flex: 1, justifyContent: 'center' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  nameUnread: { fontWeight: '800' },
  time: { fontSize: 11, color: '#AAA' },
  city: { fontSize: 12, color: '#888', marginBottom: 4 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 13,
    color: '#888',
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: { color: '#333', fontWeight: '600' },

  // Badge
  badge: {
    backgroundColor: RED,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: '#888', marginTop: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#888' },
});
