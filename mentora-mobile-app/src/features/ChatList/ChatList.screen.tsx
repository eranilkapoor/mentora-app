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
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { resolveApiUrl } from '@/core/utils/config';
import {
  ChatConversation,
  useGetConversationsQuery,
  useRespondChatRequestMutation,
  useUpdateRoomSettingsMutation,
} from '@/store/services/chatApi.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUnreadCount } from '@/store/slices/chats.slice';
import {
  REALTIME_CONVERSATION_UPDATED_EVENT,
  REALTIME_TYPING_EVENT,
  RealtimeTypingPayload,
} from '@/core/realtime/realtime.service';
import { showError } from '@/core/utils/toast';
import { ChatRow } from './components/ChatRow';
import { SkeletonList } from './components/SkeletonList';
import { chatListStyles } from './ChatList.styles';
import { ChatFilter, ChatListProps, ChatMatch } from './ChatList.types';

const FILTERS: Array<{
  key: ChatFilter;
  labelKey: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}> = [
  { key: 'all', labelKey: 'chat.filters.all', icon: 'inbox' },
  { key: 'unread', labelKey: 'chat.filters.unread', icon: 'message-circle' },
  { key: 'online', labelKey: 'chat.filters.online', icon: 'radio' },
  { key: 'pinned', labelKey: 'chat.filters.pinned', icon: 'star' },
  { key: 'muted', labelKey: 'chat.filters.muted', icon: 'bell-off' },
  { key: 'archived', labelKey: 'chat.filters.archived', icon: 'archive' },
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
  const { t } = useTranslation();
  const currentUserId = useAppSelector((state) => state.auth.user?.userId);
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');
  const [page, setPage] = useState(1);
  const [conversationPages, setConversationPages] = useState<
    ChatConversation[]
  >([]);
  const [totalUnread, setTotalUnread] = useState(0);
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
  const [respondChatRequest, { isLoading: isRespondingRequest }] =
    useRespondChatRequestMutation();

  useEffect(() => {
    setPage(1);
    setConversationPages([]);
  }, [activeFilter, query]);

  useEffect(() => {
    if (!data?.success) return;
    setTotalUnread(data.data.unreadTotal);
    dispatch(setUnreadCount(data.data.unreadTotal));

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
  }, [data, dispatch, page]);

  useEffect(() => {
    const typingTimers = typingTimersRef.current;
    const typingSubscription = DeviceEventEmitter.addListener(
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
    const conversationSubscription = DeviceEventEmitter.addListener(
      REALTIME_CONVERSATION_UPDATED_EVENT,
      (conversation: ChatConversation) => {
        setConversationPages((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.roomId === conversation.roomId
          );

          if (existingIndex < 0) {
            return prev;
          }

          const previousUnreadCount = prev[existingIndex]?.unreadCount ?? 0;
          const unreadDelta = conversation.unreadCount - previousUnreadCount;
          if (unreadDelta !== 0) {
            setTotalUnread((value) => {
              const nextUnread = Math.max(0, value + unreadDelta);
              dispatch(setUnreadCount(nextUnread));
              return nextUnread;
            });
          }

          if (activeFilter === 'unread' && conversation.unreadCount === 0) {
            return prev.filter((item) => item.roomId !== conversation.roomId);
          }

          const next = [...prev];
          next[existingIndex] = conversation;
          return next;
        });
      }
    );

    return () => {
      typingSubscription.remove();
      conversationSubscription.remove();
      Object.values(typingTimers).forEach(clearTimeout);
    };
  }, [activeFilter, currentUserId, dispatch]);

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
              : t('chat.mentora_member');
        const avatarUrl = participant.avatarUrl
          ? resolveApiUrl(participant.avatarUrl)
          : null;

        return {
          id: participant.userId,
          roomId: conversation.roomId,
          status: conversation.status,
          requestedById: conversation.requestedById,
          name,
          age: 0,
          city:
            [participant.city, participant.country]
              .filter(Boolean)
              .join(', ') || t('common.empty_value'),
          lastMessage: conversation.lastMessage?.text ?? '',
          lastMessageStatus: getLastMessageStatus(conversation.lastMessage),
          ...(conversation.lastMessage?.senderId
            ? { lastMessageSenderId: conversation.lastMessage.senderId }
            : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
          matchedAt: conversation.updatedAt ?? new Date().toISOString(),
          isOnline: Boolean(participant.isOnline),
          lastSeen: participant.lastSeen ?? null,
          unreadCount: conversation.unreadCount,
          isArchived: Boolean(conversation.settings?.archived),
          isPinned: Boolean(conversation.settings?.pinned),
          isMuted: Boolean(conversation.settings?.mutedUntil),
          isRequestIncoming:
            conversation.status === 'PENDING' &&
            Boolean(
              currentUserId &&
              conversation.requestedById &&
              conversation.requestedById !== currentUserId
            ),
          isRequestOutgoing:
            conversation.status === 'PENDING' &&
            Boolean(
              currentUserId &&
              conversation.requestedById &&
              conversation.requestedById === currentUserId
            ),
        };
      }),
    [conversationPages, currentUserId, t]
  );

  const visibleMatches = matches;

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
          title: t('chat.unable_update_title'),
          message: t('common.try_again_message'),
        });
      }
    },
    [isUpdatingSettings, t, updateRoomSettings]
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
          title: t('chat.unable_update_title'),
          message: t('common.try_again_message'),
        });
      }
    },
    [isUpdatingSettings, t, updateRoomSettings]
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
          title: t('chat.unable_update_title'),
          message: t('common.try_again_message'),
        });
      }
    },
    [isUpdatingSettings, t, updateRoomSettings]
  );

  const handleRespondRequest = useCallback(
    async (item: ChatMatch, action: 'ACCEPT' | 'REJECT') => {
      if (!item.roomId || isRespondingRequest) return;

      try {
        await respondChatRequest({ roomId: item.roomId, action }).unwrap();
      } catch {
        showError({
          title: t('chat.unable_update_title'),
          message: t('common.try_again_message'),
        });
      }
    },
    [isRespondingRequest, respondChatRequest, t]
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
        onAcceptRequest={() => {
          void handleRespondRequest(item, 'ACCEPT');
        }}
        onRejectRequest={() => {
          void handleRespondRequest(item, 'REJECT');
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
      handleRespondRequest,
      navigation,
      typingByRoom,
    ]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header
        title={t('chat.messages')}
        {...(!isLoading
          ? {
              subtitle:
                totalUnread > 0
                  ? t('chat.unread_count', { count: totalUnread })
                  : t('chat.conversation_count', {
                      count: visibleMatches.length,
                    }),
            }
          : {})}
        enableSearch
        searchPlaceholder={t('chat.search_placeholder')}
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
            const label = t(filter.labelKey);
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('chat.filter_accessibility_label', {
                  filter: label,
                })}
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
                  {label}
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
              ? t('chat.no_conversations_found')
              : t('chat.no_conversations_yet')}
          </Text>

          <Text style={styles.emptySub}>
            {query.length > 0
              ? t('chat.no_matches_for_query', { query })
              : activeFilter === 'unread'
                ? t('chat.caught_up')
                : activeFilter === 'online'
                  ? t('chat.no_online_members')
                  : activeFilter === 'archived'
                    ? t('chat.archived_empty')
                    : t('chat.start_after_interest')}
          </Text>

          {query.length === 0 && activeFilter === 'all' && (
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.getParent()?.navigate('Learn')}
            >
              <Text style={styles.emptyBtnText}>
                {t('chat.start_learning')}
              </Text>
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
              <Text style={styles.loadingMoreText}>{t('common.loading')}</Text>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}
