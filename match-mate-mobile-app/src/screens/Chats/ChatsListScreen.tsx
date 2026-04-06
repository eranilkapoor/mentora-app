import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
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
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chatsListStyles } from './ChatsListScreen.styles';

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

const ChatRow: React.FC<ChatRowProps> = ({ item, onPress }) => {
  const styles = useThemedStyles(chatsListStyles);

  return (
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
          <Text
            style={[styles.name, item.unreadCount > 0 && styles.nameUnread]}
          >
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
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(chatsListStyles);

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
    void loadMatches();
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
          <ActivityIndicator size="large" color={Colors.primary} />
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
              colors={[Colors.primary]}
              tintColor={Colors.primary}
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
