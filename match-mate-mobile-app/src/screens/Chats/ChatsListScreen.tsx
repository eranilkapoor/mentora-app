import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chatsListStyles } from './ChatsListScreen.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  ChatScreen: { userId: string; partnerName: string; partnerPhoto: string };
};

type Props = { navigation: NavigationProp<RootStackParamList> };

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockFetchMatches = async (): Promise<ChatMatch[]> => {
  await new Promise<void>((r) => setTimeout(r, 600));
  return [
    {
      id: '1',
      name: 'Priya Sharma',
      age: 28,
      city: 'Mumbai',
      lastMessage: 'Hi, how are you? 😊',
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
    {
      id: '4',
      name: 'Rahul Mehta',
      age: 30,
      city: 'Pune',
      lastMessage: 'Would love to know more about you.',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
      matchedAt: new Date(Date.now() - 86400000).toISOString(),
      isOnline: false,
      unreadCount: 0,
    },
  ];
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonList(): React.ReactElement {
  const styles = useThemedStyles(chatsListStyles);
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonLines}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
          </View>
        </View>
      ))}
    </>
  );
}

// ─── Chat Row ─────────────────────────────────────────────────────────────────

function ChatRow({
  item,
  onPress,
}: {
  item: ChatMatch;
  onPress: () => void;
}): React.ReactElement {
  const styles = useThemedStyles(chatsListStyles);

  return (
    <TouchableOpacity
      style={[styles.card, item.unreadCount > 0 && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${item.name}`}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: item.avatarUrl }}
          style={[
            styles.avatar,
            item.unreadCount > 0 && styles.avatarUnread,
          ]}
        />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text
            style={[styles.name, item.unreadCount > 0 && styles.nameUnread]}
            numberOfLines={1}
          >
            {item.name}, {item.age}
          </Text>
          <Text
            style={[
              styles.time,
              item.unreadCount > 0 && styles.timeUnread,
            ]}
          >
            {formatTime(item.matchedAt)}
          </Text>
        </View>

        <View style={styles.cityRow}>
          <Feather name="map-pin" size={11} color={Colors.textMuted} />
          <Text style={styles.city}>{item.city}</Text>
        </View>

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
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ChatListScreen({ navigation }: Props): React.ReactElement {
  const styles = useThemedStyles(chatsListStyles);
  const [matches, setMatches] = useState<ChatMatch[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async (): Promise<void> => {
    const data = await mockFetchMatches();
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  }, [loadMatches]);

  const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );

  const totalUnread = matches.reduce((sum, m) => sum + m.unreadCount, 0);

  const renderItem: ListRenderItem<ChatMatch> = useCallback(
    ({ item }) => (
      <ChatRow
        item={item}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            userId: item.id,
            partnerName: item.name,
            partnerPhoto: item.avatarUrl,
          })
        }
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrapper}>
            <Feather name="message-circle" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {!loading && (
              <Text style={styles.headerSub}>
                {totalUnread > 0
                  ? `${totalUnread} unread`
                  : `${matches.length} conversations`}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          accessibilityRole="button"
          accessibilityLabel="Filter conversations"
        >
          <Feather name="sliders" size={14} color={Colors.textSecondary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ───────────────────────────────────────────────── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            placeholder="Search conversations…"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search conversations"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Content ──────────────────────────────────────────────── */}
      {loading ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyIconWrapper}>
            <Feather name="message-circle" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {query.length > 0 ? 'No results found' : 'No conversations yet'}
          </Text>
          <Text style={styles.emptySub}>
            {query.length > 0
              ? `No matches for "${query}"`
              : 'Start chatting with your matches!'}
          </Text>
          {query.length === 0 && (
            <TouchableOpacity style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Browse Matches</Text>
            </TouchableOpacity>
          )}
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
}