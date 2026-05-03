import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chatListStyles } from './ChatList.styles';

import { ChatListProps, ChatMatch, mockFetchMatches } from './ChatList.types';

import { ChatRow } from './components/ChatRow';
import { SkeletonList } from './components/SkeletonList';
import Header from '@/core/components/Header';

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

export default function ChatListScreen({
  navigation,
}: ChatListProps): React.ReactElement {
  const styles = useThemedStyles(chatListStyles);
  const { theme } = useTheme();

  const [matches, setMatches] = useState<ChatMatch[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Load data ─────────────────────────────
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

  // ─── Filter ───────────────────────────────
  const filtered = matches.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalUnread = matches.reduce((sum, m) => sum + m.unreadCount, 0);

  // ─── Render row ───────────────────────────
  const renderItem: ListRenderItem<ChatMatch> = useCallback(
    ({ item }) => (
      <ChatRow
        item={item}
        onPress={() =>
          navigation.navigate('ChatDetails', {
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
      {/* ─── HEADER (UPDATED) ───────────────── */}
      <Header
        title="Messages"
        subtitle={
          loading
            ? undefined
            : totalUnread > 0
              ? `${totalUnread} unread`
              : `${matches.length} conversations`
        }
        enableSearch
        onSearchChange={setQuery}
        actions={[
          {
            icon: 'sliders',
            onPress: () => {
              // TODO: open filter modal
            },
            accessibilityLabel: 'Filter conversations',
          },
        ]}
      />

      {/* ─── Content ───────────────────────── */}
      {loading ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyIconWrapper}>
            <Feather
              name="message-circle"
              size={36}
              color={theme.colors.primary}
            />
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
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('ChatDetails' as never)}
            >
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
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}
