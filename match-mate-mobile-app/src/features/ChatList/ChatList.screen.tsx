import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { resolveApiUrl } from '@/core/utils/config';
import {
  ChatConversation,
  useGetConversationsQuery,
  useUpdateRoomSettingsMutation,
} from '@/store/services/chatApi.service';
import { useAppSelector } from '@/store/hooks';
import {
  REALTIME_TYPING_EVENT,
  RealtimeTypingPayload,
} from '@/core/realtime/realtime.service';
import { showError } from '@/core/utils/toast';
import { ChatRow } from './components/ChatRow';
import { SkeletonList } from './components/SkeletonList';
import { chatListStyles } from './ChatList.styles';
import { ChatFilter, ChatListProps, ChatMatch } from './ChatList.types';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=12';
const FILTERS: Array<{
  key: ChatFilter;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}> = [
  { key: 'all', label: 'All', icon: 'inbox' },
  { key: 'unread', label: 'Unread', icon: 'message-circle' },
  { key: 'online', label: 'Online', icon: 'radio' },
  { key: 'pinned', label: 'Pinned', icon: 'star' },
  { key: 'muted', label: 'Muted', icon: 'bell-off' },
  { key: 'archived', label: 'Archived', icon: 'archive' },
];
const PAGE_SIZE = 20;

const getLastMessageStatus = (
  lastMessage?: ChatConversation['lastMessage']
): ChatMatch['lastMessageStatus'] => {
  if (!lastMessage) return null;
  if (lastMessage.readAt) return 'read';
  if (
    lastMessage.deliveredAt ||
    String(lastMessage.status).toUpperCase() === 'DELIVERED'
  ) {
    return 'delivered';
  }
  return 'sent';
};

export default function ChatListScreen({
  navigation,
}: ChatListProps): React.ReactElement {
  const styles = useThemedStyles(chatListStyles);
  const { theme } = useTheme();
  const currentUserId = useAppSelector((state) => state.auth.user?.userId);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');
  const [page, setPage] = useState(1);
  const [conversationPages, setConversationPages] = useState<
    ChatConversation[]
  >([]);
  const [typingByRoom, setTypingByRoom] = useState<Record<string, boolean>>({});
  const hasFocusedOnceRef = useRef(false);
  const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  const conversationQuery = useMemo(
    () => ({
      ...(query.trim() ? { search: query.trim() } : {}),
      ...(activeFilter === 'unread' ? { onlyUnread: true } : {}),
      ...(activeFilter === 'archived'
        ? { includeArchived: true, onlyArchived: true }
        : {}),
      ...(activeFilter === 'pinned' ? { onlyPinned: true } : {}),
      ...(activeFilter === 'muted' ? { onlyMuted: true } : {}),
      ...(activeFilter === 'online' ? { onlyOnline: true } : {}),
      page,
      limit: PAGE_SIZE,
    }),
    [activeFilter, page, query]
  );
  const { data, isLoading, isFetching, refetch } =
    useGetConversationsQuery(conversationQuery);
  const [updateRoomSettings, { isLoading: isUpdatingSettings }] =
    useUpdateRoomSettingsMutation();

  useEffect(() => {
    setPage(1);
    setConversationPages([]);
  }, [activeFilter, query]);

  useEffect(() => {
    if (!data?.success) return;

    setConversationPages((prev) => {
      const next = page === 1 ? [] : [...prev];
      data.data.items.forEach((conversation) => {
        const existingIndex = next.findIndex(
          (item) => item.roomId === conversation.roomId
        );
        if (existingIndex >= 0) {
          next[existingIndex] = conversation;
        } else {
          next.push(conversation);
        }
      });
      return next;
    });
  }, [data, page]);

  useEffect(() => {
    const typingTimers = typingTimersRef.current;
    const subscription = DeviceEventEmitter.addListener(
      REALTIME_TYPING_EVENT,
      (payload: RealtimeTypingPayload) => {
        if (payload.userId === currentUserId) return;

        setTypingByRoom((prev) => ({
          ...prev,
          [payload.roomId]: payload.isTyping,
        }));

        if (typingTimersRef.current[payload.roomId]) {
          clearTimeout(typingTimersRef.current[payload.roomId]);
        }

        if (payload.isTyping) {
          typingTimersRef.current[payload.roomId] = setTimeout(() => {
            setTypingByRoom((prev) => ({
              ...prev,
              [payload.roomId]: false,
            }));
          }, 2500);
        }
      }
    );

    return () => {
      subscription.remove();
      Object.values(typingTimers).forEach(clearTimeout);
    };
  }, [currentUserId]);

  const matches = useMemo<ChatMatch[]>(
    () =>
      conversationPages.map((conversation) => {
        const participant = conversation.participant;
        const fullName = participant.fullName?.trim();
        const generatedName = [participant.firstName, participant.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();
        const name =
          fullName && fullName.length > 0
            ? fullName
            : generatedName.length > 0
              ? generatedName
              : 'MatchMate Member';
        const avatarUrl = participant.avatarUrl
          ? resolveApiUrl(participant.avatarUrl)
          : null;

        return {
          id: participant.userId,
          roomId: conversation.roomId,
          name,
          age: 0,
          city:
            [participant.city, participant.country]
              .filter(Boolean)
              .join(', ') || '-',
          lastMessage: conversation.lastMessage?.text ?? '',
          lastMessageStatus: getLastMessageStatus(conversation.lastMessage),
          ...(conversation.lastMessage?.senderId
            ? { lastMessageSenderId: conversation.lastMessage.senderId }
            : {}),
          avatarUrl: avatarUrl ?? FALLBACK_AVATAR,
          matchedAt: conversation.updatedAt ?? new Date().toISOString(),
          isOnline: Boolean(participant.isOnline),
          unreadCount: conversation.unreadCount,
          isArchived: Boolean(conversation.settings?.archived),
          isPinned: Boolean(conversation.settings?.pinned),
          isMuted: Boolean(conversation.settings?.mutedUntil),
        };
      }),
    [conversationPages]
  );

  const visibleMatches = matches;

  const totalUnread = data?.success ? data.data.unreadTotal : 0;
  const hasMore = Boolean(data?.success && data.data.hasMore);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((value) => value + 1);
  }, [hasMore, isFetching]);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return;
      }

      void refetch();
    }, [refetch])
  );

  const handleTogglePin = useCallback(
    async (item: ChatMatch) => {
      if (!item.roomId || isUpdatingSettings) return;

      try {
        await updateRoomSettings({
          roomId: item.roomId,
          pinned: !item.isPinned,
        }).unwrap();
      } catch {
        showError({
          title: 'Unable to update chat',
          message: 'Please try again.',
        });
      }
    },
    [isUpdatingSettings, updateRoomSettings]
  );

  const handleToggleMute = useCallback(
    async (item: ChatMatch) => {
      if (!item.roomId || isUpdatingSettings) return;

      try {
        await updateRoomSettings({
          roomId: item.roomId,
          mutedUntil: item.isMuted
            ? null
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }).unwrap();
      } catch {
        showError({
          title: 'Unable to update chat',
          message: 'Please try again.',
        });
      }
    },
    [isUpdatingSettings, updateRoomSettings]
  );

  const handleToggleArchive = useCallback(
    async (item: ChatMatch) => {
      if (!item.roomId || isUpdatingSettings) return;

      try {
        await updateRoomSettings({
          roomId: item.roomId,
          archived: !item.isArchived,
        }).unwrap();
      } catch {
        showError({
          title: 'Unable to update chat',
          message: 'Please try again.',
        });
      }
    },
    [isUpdatingSettings, updateRoomSettings]
  );

  const renderItem: ListRenderItem<ChatMatch> = useCallback(
    ({ item }) => (
      <ChatRow
        item={item}
        isTyping={Boolean(item.roomId && typingByRoom[item.roomId])}
        isOwnLastMessage={Boolean(
          currentUserId &&
          item.lastMessageSenderId &&
          item.lastMessageSenderId === currentUserId
        )}
        onTogglePin={() => {
          void handleTogglePin(item);
        }}
        onToggleMute={() => {
          void handleToggleMute(item);
        }}
        onToggleArchive={() => {
          void handleToggleArchive(item);
        }}
        onPress={() =>
          navigation.navigate('ChatDetails', {
            userId: item.id,
            ...(item.roomId ? { roomId: item.roomId } : {}),
            partnerName: item.name,
            partnerPhoto: item.avatarUrl,
          })
        }
      />
    ),
    [
      currentUserId,
      handleToggleArchive,
      handleToggleMute,
      handleTogglePin,
      navigation,
      typingByRoom,
    ]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Messages"
        {...(!isLoading
          ? {
              subtitle:
                totalUnread > 0
                  ? `${totalUnread} unread`
                  : `${visibleMatches.length} conversations`,
            }
          : {})}
        enableSearch
        searchPlaceholder="Search name, city, or message"
        onSearchChange={setQuery}
      />

      <View style={styles.filterRail}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          keyboardShouldPersistTaps="handled"
        >
          {FILTERS.map((filter) => {
            const selected = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${filter.label} conversations`}
              >
                <Feather
                  name={filter.icon}
                  size={14}
                  color={
                    selected ? theme.colors.white : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selected && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
                {filter.key === 'unread' && totalUnread > 0 ? (
                  <View
                    style={[
                      styles.filterCount,
                      selected && styles.filterCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        selected && styles.filterCountTextActive,
                      ]}
                    >
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <SkeletonList />
      ) : visibleMatches.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyIconWrapper}>
            <Feather
              name="message-circle"
              size={36}
              color={theme.colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            {query.length > 0 || activeFilter !== 'all'
              ? 'No conversations found'
              : 'No conversations yet'}
          </Text>

          <Text style={styles.emptySub}>
            {query.length > 0
              ? `No matches for "${query}"`
              : activeFilter === 'unread'
                ? 'You are all caught up.'
                : activeFilter === 'online'
                  ? 'No matched members are online right now.'
                  : activeFilter === 'archived'
                    ? 'Archived conversations will appear here.'
                    : 'Start chatting after an interest is accepted.'}
          </Text>

          {query.length === 0 && activeFilter === 'all' && (
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.getParent()?.navigate('Matches')}
            >
              <Text style={styles.emptyBtnText}>Browse Matches</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={visibleMatches}
          keyExtractor={(item) => item.roomId ?? item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}
