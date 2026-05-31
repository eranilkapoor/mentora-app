import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/core/components/Header';
import { EMOJIS } from '../../core/constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useAppSelector } from '@/store/hooks';
import {
  ChatMessage,
  useCreateDirectRoomMutation,
  useGetMessagesQuery,
  useMarkRoomReadMutation,
  useSendMessageMutation,
} from '@/store/services/chatApi.service';
import {
  useBlockUserMutation,
  useReportUserMutation,
} from '@/store/services/privacySettingsApi.service';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showInfo, showSuccess } from '@/core/utils/toast';
import { chatStyles } from './Chat.styles';
import { formatDateLabel, Message, Props } from './Chat.types';
import { DateSeparator } from './components/DateSeparator';
import { MessageBubble } from './components/MessageBubble';
import {
  emitTyping,
  joinChatRoom,
  leaveChatRoom,
  REALTIME_USER_BLOCKED_EVENT,
  UserBlockedPayload,
} from '@/core/realtime/realtime.service';

const mapMessage = (message: ChatMessage): Message => ({
  id: message.id,
  senderId: message.senderId,
  text: message.content ?? '',
  timestamp: message.createdAt
    ? new Date(message.createdAt).getTime()
    : Date.now(),
  type: String(message.type).toLowerCase() === 'image' ? 'image' : 'text',
  status: message.readAt
    ? 'read'
    : message.deliveredAt ||
        String(message.status).toUpperCase() === 'DELIVERED'
      ? 'delivered'
      : 'sent',
});

export default function ChatScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const styles = useThemedStyles(chatStyles);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const currentUserId = useAppSelector((state) => state.auth.user?.userId);
  const { userId, roomId, partnerName, partnerPhoto } = route.params ?? {};
  const [activeRoomId, setActiveRoomId] = useState(roomId);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const inputBarSafeAreaStyle = useMemo<ViewStyle>(
    () => ({
      paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8,
    }),
    [insets.bottom]
  );
  const [createDirectRoom, { isLoading: isCreatingRoom }] =
    useCreateDirectRoomMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markRoomRead] = useMarkRoomReadMutation();
  const [blockUser] = useBlockUserMutation();
  const [reportUser] = useReportUserMutation();
  const lastReadRequestRef = useRef<string | null>(null);
  const { data, isFetching } = useGetMessagesQuery(
    { roomId: activeRoomId ?? '', limit: 50 },
    { skip: !activeRoomId }
  );

  const handleOpenProfile = useCallback((): void => {
    if (!userId) return;
    navigation.navigate('MatchDetails', { userId });
  }, [navigation, userId]);

  useEffect(() => {
    if (!activeRoomId) return;

    joinChatRoom(activeRoomId);

    return () => {
      leaveChatRoom(activeRoomId);
    };
  }, [activeRoomId]);

  useEffect(() => {
    if (!currentUserId || !userId) return;

    const subscription = DeviceEventEmitter.addListener(
      REALTIME_USER_BLOCKED_EVENT,
      (payload: UserBlockedPayload) => {
        const affectsThisChat =
          [payload.blockerId, payload.blockedUserId].includes(currentUserId) &&
          [payload.blockerId, payload.blockedUserId].includes(userId);

        if (!affectsThisChat) return;

        showInfo({
          title: 'Conversation unavailable',
          message: 'This conversation is no longer available.',
        });
        navigation.goBack();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [currentUserId, navigation, userId]);

  useEffect(() => {
    if (activeRoomId || !userId) {
      return;
    }

    let isMounted = true;

    const ensureRoom = async () => {
      try {
        const response = await createDirectRoom({
          targetUserId: userId,
        }).unwrap();
        if (!response.success) {
          throw new Error(response.message);
        }

        const resolvedRoomId =
          response.data?.roomId ?? response.data?.room?.roomId ?? undefined;

        if (isMounted && resolvedRoomId) {
          setActiveRoomId(resolvedRoomId);
        }
      } catch {
        showError({
          title: 'Chat unavailable',
          message: 'You can chat after both users have accepted the match.',
        });
        navigation.goBack();
      }
    };

    void ensureRoom();

    return () => {
      isMounted = false;
    };
  }, [activeRoomId, createDirectRoom, navigation, userId]);

  const messages = useMemo(
    () =>
      (data?.success ? data.data.items : [])
        .map(mapMessage)
        .map((message) => ({
          ...message,
          senderId:
            currentUserId && message.senderId === currentUserId
              ? 'me'
              : message.senderId,
        }))
        .reverse(),
    [currentUserId, data]
  );

  useEffect(() => {
    if (!activeRoomId || !currentUserId || !data?.success) return;

    const incomingUnreadMessages = data.data.items.filter(
      (message) => message.senderId !== currentUserId && !message.readAt
    );
    const latestUnreadMessage =
      incomingUnreadMessages[incomingUnreadMessages.length - 1];

    if (!latestUnreadMessage) return;

    const requestKey = `${activeRoomId}:${latestUnreadMessage.id}`;
    if (lastReadRequestRef.current === requestKey) return;

    lastReadRequestRef.current = requestKey;
    void markRoomRead({
      roomId: activeRoomId,
      upToMessageId: latestUnreadMessage.id,
    })
      .unwrap()
      .catch(() => {
        lastReadRequestRef.current = null;
      });
  }, [activeRoomId, currentUserId, data, markRoomRead]);

  const handleSend = useCallback(async (): Promise<void> => {
    const content = inputText.trim();
    if (!content || !activeRoomId || isSending) return;

    try {
      await sendMessage({
        roomId: activeRoomId,
        content,
        clientMessageId: `${Date.now()}`,
      }).unwrap();
      setInputText('');
      setShowEmojiPicker(false);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch {
      showError({ title: 'Message not sent', message: 'Please try again.' });
    }
  }, [activeRoomId, inputText, isSending, sendMessage]);

  const handlePickImage = useCallback((): void => {
    showInfo({
      title: 'Image messages',
      message:
        'Image sending will be available after media upload is connected to chat attachments.',
    });
  }, []);

  const handleReportUser = useCallback((): void => {
    if (!userId) return;

    showConfirm({
      title: 'Report user?',
      message: `Report ${partnerName ?? 'this user'}?`,
      confirmText: 'Report',
      destructive: true,
      onConfirm: () => {
        void reportUser({
          targetUserId: userId,
          reason: 'Reported from chat',
        })
          .unwrap()
          .then(() => {
            showSuccess({
              title: 'Report submitted',
              message:
                'Our team will review this chat. This user has also been blocked.',
            });
            navigation.goBack();
          })
          .catch(() => {
            showError({
              title: 'Unable to report',
              message: 'Please try again.',
            });
          });
      },
    });
  }, [navigation, partnerName, reportUser, userId]);

  const handleBlockUser = useCallback((): void => {
    if (!userId) return;

    showConfirm({
      title: 'Block user?',
      message: 'You will no longer receive messages from this user.',
      confirmText: 'Block',
      destructive: true,
      onConfirm: () => {
        void blockUser({ targetUserId: userId })
          .unwrap()
          .then(() => {
            showSuccess({
              title: 'User blocked',
              message: 'This user has been blocked.',
            });
            navigation.goBack();
          })
          .catch(() => {
            showError({
              title: 'Unable to block',
              message: 'Please try again.',
            });
          });
      },
    });
  }, [blockUser, navigation, userId]);

  const appendEmoji = useCallback((emoji: string): void => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item, index }) => (
      <>
        <MessageBubble item={item} />
        {index < messages.length - 1 &&
          formatDateLabel(item.timestamp) !==
            formatDateLabel(messages[index + 1]?.timestamp ?? 0) && (
            <DateSeparator ts={item.timestamp} />
          )}
      </>
    ),
    [messages]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={partnerName ?? 'Chat'}
        subtitle={isCreatingRoom || isFetching ? 'Syncing...' : 'Messages'}
        avatarUri={partnerPhoto ?? 'https://i.pravatar.cc/150?img=12'}
        onIdentityPress={handleOpenProfile}
        identityAccessibilityLabel={`View ${partnerName ?? 'this user'} profile`}
        actions={[
          {
            icon: 'flag',
            onPress: handleReportUser,
            accessibilityLabel: 'Report user',
          },
          {
            icon: 'slash',
            onPress: handleBlockUser,
            accessibilityLabel: 'Block user',
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
        style={styles.flex}
      >
        <View style={styles.chatSurface}>
          <FlatList
            ref={listRef}
            data={messages}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListFooterComponent={
              messages.length > 0 ? (
                <DateSeparator
                  ts={messages[messages.length - 1]?.timestamp ?? Date.now()}
                />
              ) : null
            }
          />

          {showEmojiPicker && (
            <View style={styles.emojiBox}>
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => appendEmoji(emoji)}
                  style={styles.emojiBtn}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.inputBar, inputBarSafeAreaStyle]}>
            <TouchableOpacity
              onPress={() => setShowEmojiPicker((value) => !value)}
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Open emoji picker"
            >
              <Feather
                name="smile"
                size={20}
                color={
                  showEmojiPicker
                    ? theme.colors.primary
                    : theme.colors.textMuted
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Send image"
            >
              <Feather name="image" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textMuted}
              value={inputText}
              onChangeText={(value) => {
                setInputText(value);
                if (activeRoomId) {
                  emitTyping(activeRoomId, value.trim().length > 0);
                }
              }}
              multiline
              blurOnSubmit={false}
              accessibilityLabel="Message input"
            />

            <TouchableOpacity
              onPress={() => {
                void handleSend();
              }}
              style={[
                styles.sendBtn,
                inputText.trim().length > 0 && styles.sendBtnActive,
              ]}
              activeOpacity={0.85}
              disabled={!inputText.trim() || !activeRoomId || isSending}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Feather
                name="send"
                size={18}
                color={
                  inputText.trim().length > 0 && activeRoomId
                    ? theme.colors.white
                    : theme.colors.textMuted
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
