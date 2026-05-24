import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { resolveApiUrl } from '@/core/utils/config';
import { useGetConversationsQuery } from '@/store/services/chatApi.service';
import { ChatRow } from './components/ChatRow';
import { SkeletonList } from './components/SkeletonList';
import { chatListStyles } from './ChatList.styles';
import { ChatListProps, ChatMatch } from './ChatList.types';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=12';

export default function ChatListScreen({
  navigation,
}: ChatListProps): React.ReactElement {
  const styles = useThemedStyles(chatListStyles);
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const { data, isLoading, isFetching, refetch } = useGetConversationsQuery({
    search: query || undefined,
  });

  const matches = useMemo<ChatMatch[]>(
    () =>
      (data?.success ? data.data.items : []).map((conversation) => {
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
          avatarUrl: avatarUrl ?? FALLBACK_AVATAR,
          matchedAt: conversation.updatedAt ?? new Date().toISOString(),
          isOnline: Boolean(participant.isOnline),
          unreadCount: conversation.unreadCount,
        };
      }),
    [data]
  );

  const totalUnread = data?.success ? data.data.unreadTotal : 0;

  const renderItem: ListRenderItem<ChatMatch> = useCallback(
    ({ item }) => (
      <ChatRow
        item={item}
        onPress={() =>
          navigation.navigate('ChatDetails', {
            userId: item.id,
            roomId: item.roomId,
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
      <Header
        title="Messages"
        subtitle={
          isLoading
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
            onPress: () => {},
            accessibilityLabel: 'Filter conversations',
          },
        ]}
      />

      {isLoading ? (
        <SkeletonList />
      ) : matches.length === 0 ? (
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
              : 'Start chatting after an interest is accepted.'}
          </Text>

          {query.length === 0 && (
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
          data={matches}
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}
