import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chatListStyles } from './ChatListScreen.styles';
import { Colors } from '@/core/constants/colors';
import { ChatListProps, ChatMatch, mockFetchMatches } from './ChatList.types';
import { ChatRow } from './components/ChatRow';
import { SkeletonList } from './components/SkeletonList';

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ChatListScreen({
  navigation,
}: ChatListProps): React.ReactElement {
  const styles = useThemedStyles(chatListStyles);
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
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalUnread = matches.reduce((sum, m) => sum + m.unreadCount, 0);

  const renderItem: ListRenderItem<ChatMatch> = useCallback(
    ({ item }) => (
      <ChatRow
        item={item}
        onPress={() =>
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
