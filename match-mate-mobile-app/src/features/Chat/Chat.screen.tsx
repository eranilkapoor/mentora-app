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
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
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
import { useTranslation } from 'react-i18next';
import {
  ChatMessage,
  useCreateDirectRoomMutation,
  useGetMessagesQuery,
  useMarkRoomReadMutation,
  useSendMessageMutation,
  useUploadChatAttachmentsMutation,
  useDeleteChatMessageMutation,
  useReactToMessageMutation,
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

const mapMessage = (message: ChatMessage): Message => {
  const type = String(message.type).toLowerCase();
  const isImage = type === 'image';
  const isAudio = type === 'audio';
  const attachmentUrl = (
    message.attachments as Array<{ url?: string }> | undefined
  )?.[0]?.url;
  const imageUrl = isImage ? attachmentUrl : undefined;
  const audioUrl = isAudio ? attachmentUrl : undefined;

  return {
    id: message.id,
    senderId: message.senderId,
    text: message.content ?? '',
    timestamp: message.createdAt
      ? new Date(message.createdAt).getTime()
      : Date.now(),
    type: isImage ? 'image' : isAudio ? 'audio' : 'text',
    ...(imageUrl ? { imageUrl } : {}),
    ...(audioUrl ? { audioUrl } : {}),
    reactions: message.reactions ?? [],
    status: message.readAt
      ? 'read'
      : message.deliveredAt ||
          String(message.status).toUpperCase() === 'DELIVERED'
        ? 'delivered'
        : 'sent',
  };
};

const formatRecordingDuration = (durationMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function ChatScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const styles = useThemedStyles(chatStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const currentUserId = useAppSelector((state) => state.auth.user?.userId);
  const { userId, roomId, partnerName, partnerPhoto } = route.params ?? {};
  const [activeRoomId, setActiveRoomId] = useState(roomId);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const [isRecordingBusy, setIsRecordingBusy] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const inputBarSafeAreaStyle = useMemo<ViewStyle>(
    () => ({
      paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8,
    }),
    [insets.bottom]
  );
  const [createDirectRoom, { isLoading: isCreatingRoom }] =
    useCreateDirectRoomMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [uploadChatAttachments, { isLoading: isUploadingAttachment }] =
    useUploadChatAttachmentsMutation();
  const [deleteChatMessage] = useDeleteChatMessageMutation();
  const [reactToMessage] = useReactToMessageMutation();
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

  useEffect(
    () => () => {
      const activeRecording = recordingRef.current;
      if (activeRecording) {
        void activeRecording.stopAndUnloadAsync().catch(() => undefined);
      }
      void Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(
        () => undefined
      );
    },
    []
  );

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

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
          title: t('chat.conversation_unavailable_title'),
          message: t('chat.conversation_unavailable_message'),
        });
        navigation.goBack();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [currentUserId, navigation, userId, t]);

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
          title: t('chat.chat_unavailable_title'),
          message: t('chat.chat_unavailable_message'),
        });
        navigation.goBack();
      }
    };

    void ensureRoom();

    return () => {
      isMounted = false;
    };
  }, [activeRoomId, createDirectRoom, navigation, userId, t]);

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
      showError({
        title: t('chat.message_not_sent_title'),
        message: t('chat.message_not_sent_message'),
      });
    }
  }, [activeRoomId, inputText, isSending, sendMessage, t]);

  const handlePickImage = useCallback(async (): Promise<void> => {
    if (!activeRoomId || isUploadingAttachment || isSending) return;

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        showError({
          title: t('chat.permission_needed_title'),
          message: t('chat.permission_needed_message'),
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.82,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('files', {
        uri: asset.uri,
        name: asset.fileName ?? `chat-image-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);

      const uploadResponse = await uploadChatAttachments(formData).unwrap();
      const attachment = uploadResponse.success
        ? uploadResponse.data?.[0]
        : undefined;

      if (!attachment) {
        throw new Error('Upload failed');
      }

      await sendMessage({
        roomId: activeRoomId,
        content: '',
        type: 'IMAGE',
        attachments: [attachment],
        clientMessageId: `${Date.now()}`,
      }).unwrap();
    } catch {
      showError({
        title: t('chat.image_not_sent_title'),
        message: t('chat.image_not_sent_message'),
      });
    }
  }, [
    activeRoomId,
    isSending,
    isUploadingAttachment,
    sendMessage,
    uploadChatAttachments,
    t,
  ]);

  const handleStartVoiceRecording = useCallback(async (): Promise<void> => {
    if (
      !activeRoomId ||
      isRecordingBusy ||
      isUploadingAttachment ||
      isSending
    ) {
      return;
    }

    try {
      setIsRecordingBusy(true);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        showError({
          title: t('chat.microphone_permission_title'),
          message: t('chat.microphone_permission_message'),
        });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const nextRecording = new Audio.Recording();
      nextRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setRecordingDurationMs(status.durationMillis);
        }
      });
      nextRecording.setProgressUpdateInterval(500);

      await nextRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await nextRecording.startAsync();
      setRecording(nextRecording);
      setRecordingDurationMs(0);
      setShowEmojiPicker(false);
    } catch {
      showError({
        title: t('chat.voice_not_started_title'),
        message: t('chat.voice_not_started_message'),
      });
    } finally {
      setIsRecordingBusy(false);
    }
  }, [activeRoomId, isRecordingBusy, isSending, isUploadingAttachment, t]);

  const handleStopVoiceRecording = useCallback(
    async (shouldSend = true): Promise<void> => {
      if (!recording || isRecordingBusy) {
        return;
      }

      try {
        setIsRecordingBusy(true);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        const uri = recording.getURI();
        const durationMs = recordingDurationMs;
        setRecording(null);
        setRecordingDurationMs(0);

        if (!shouldSend || !uri || !activeRoomId || durationMs < 800) {
          return;
        }

        const formData = new FormData();
        formData.append('files', {
          uri,
          name: `voice-message-${Date.now()}.m4a`,
          type: 'audio/m4a',
        } as unknown as Blob);

        const uploadResponse = await uploadChatAttachments(formData).unwrap();
        const attachment = uploadResponse.success
          ? uploadResponse.data?.[0]
          : undefined;

        if (!attachment) {
          throw new Error('Upload failed');
        }

        await sendMessage({
          roomId: activeRoomId,
          content: '',
          type: 'AUDIO',
          attachments: [attachment],
          clientMessageId: `${Date.now()}`,
        }).unwrap();
      } catch {
        showError({
          title: t('chat.voice_not_sent_title'),
          message: t('chat.voice_not_sent_message'),
        });
      } finally {
        setIsRecordingBusy(false);
      }
    },
    [
      activeRoomId,
      isRecordingBusy,
      recording,
      recordingDurationMs,
      sendMessage,
      t,
      uploadChatAttachments,
    ]
  );

  const handleDeleteMessage = useCallback(
    (message: Message): void => {
      if (!activeRoomId || message.senderId !== 'me') return;

      showConfirm({
        title: t('chat.delete_message_title'),
        message: t('chat.delete_message_message'),
        confirmText: t('common.delete'),
        destructive: true,
        onConfirm: () => {
          void deleteChatMessage({
            roomId: activeRoomId,
            messageId: message.id,
          })
            .unwrap()
            .then(() => {
              showSuccess({ title: t('chat.message_deleted_title') });
            })
            .catch(() => {
              showError({
                title: t('chat.unable_delete_title'),
                message: t('chat.unable_delete_message'),
              });
            });
        },
      });
    },
    [activeRoomId, deleteChatMessage, t]
  );

  const handleReactToMessage = useCallback(
    (message: Message, emoji: string): void => {
      if (!activeRoomId || !currentUserId) return;

      const existingReaction = message.reactions?.find(
        (reaction) => reaction.userId === currentUserId
      );
      const nextEmoji = existingReaction?.emoji === emoji ? undefined : emoji;

      void reactToMessage({
        roomId: activeRoomId,
        messageId: message.id,
        emoji: nextEmoji,
      })
        .unwrap()
        .catch(() => {
          showError({
            title: t('chat.reaction_failed_title', {
              defaultValue: 'Reaction not updated',
            }),
            message: t('chat.reaction_failed_message', {
              defaultValue: 'Please try again in a moment.',
            }),
          });
        });
    },
    [activeRoomId, currentUserId, reactToMessage, t]
  );

  const handleReportUser = useCallback((): void => {
    if (!userId) return;

    showConfirm({
      title: t('chat.report_user_title'),
      message: t('chat.report_user_message', {
        user: partnerName ?? t('chat.this_user'),
      }),
      confirmText: t('chat.report'),
      destructive: true,
      onConfirm: () => {
        void reportUser({
          targetUserId: userId,
          reason: 'Reported from chat',
        })
          .unwrap()
          .then(() => {
            showSuccess({
              title: t('chat.report_submitted_title'),
              message: t('chat.report_submitted_message'),
            });
            navigation.goBack();
          })
          .catch(() => {
            showError({
              title: t('chat.unable_report_title'),
              message: t('chat.unable_report_message'),
            });
          });
      },
    });
  }, [navigation, partnerName, reportUser, userId, t]);

  const handleBlockUser = useCallback((): void => {
    if (!userId) return;

    showConfirm({
      title: t('chat.block_user_title'),
      message: t('chat.block_user_message'),
      confirmText: t('chat.block'),
      destructive: true,
      onConfirm: () => {
        void blockUser({ targetUserId: userId })
          .unwrap()
          .then(() => {
            showSuccess({
              title: t('chat.user_blocked_title'),
              message: t('chat.user_blocked_message'),
            });
            navigation.goBack();
          })
          .catch(() => {
            showError({
              title: t('chat.unable_block_title'),
              message: t('chat.unable_block_message'),
            });
          });
      },
    });
  }, [blockUser, navigation, userId, t]);

  const appendEmoji = useCallback((emoji: string): void => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item, index }) => (
      <>
        <MessageBubble
          item={item}
          onLongPress={handleDeleteMessage}
          onReact={handleReactToMessage}
        />
        {index < messages.length - 1 &&
          formatDateLabel(item.timestamp) !==
            formatDateLabel(messages[index + 1]?.timestamp ?? 0) && (
            <DateSeparator ts={item.timestamp} />
          )}
      </>
    ),
    [handleDeleteMessage, handleReactToMessage, messages]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={partnerName ?? t('chat.chat')}
        subtitle={
          isCreatingRoom || isFetching
            ? t('common.loading')
            : t('chat.messages')
        }
        avatarUri={partnerPhoto ?? 'https://i.pravatar.cc/150?img=12'}
        onIdentityPress={handleOpenProfile}
        identityAccessibilityLabel={
          partnerName
            ? t('chat.view_user_profile', { name: partnerName })
            : t('chat.view_this_user_profile')
        }
        actions={[
          {
            icon: 'flag',
            onPress: handleReportUser,
            accessibilityLabel: t('chat.report_user'),
          },
          {
            icon: 'slash',
            onPress: handleBlockUser,
            accessibilityLabel: t('chat.block_user'),
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

          {recording ? (
            <View style={styles.recordingBar}>
              <View style={styles.recordingPulse} />
              <Text style={styles.recordingText}>
                {t('chat.recording_voice')} ·{' '}
                {formatRecordingDuration(recordingDurationMs)}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  void handleStopVoiceRecording(false);
                }}
                style={styles.recordingCancelBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('chat.cancel_voice_recording')}
              >
                <Feather name="x" size={16} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={[styles.inputBar, inputBarSafeAreaStyle]}>
            <TouchableOpacity
              onPress={() => setShowEmojiPicker((value) => !value)}
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('chat.open_emoji_picker')}
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
              onPress={() => {
                void handlePickImage();
              }}
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('chat.send_image')}
            >
              <Feather name="image" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (recording) {
                  void handleStopVoiceRecording(true);
                } else {
                  void handleStartVoiceRecording();
                }
              }}
              style={[styles.iconBtn, recording && styles.recordingIconBtn]}
              activeOpacity={0.7}
              disabled={
                !activeRoomId ||
                isRecordingBusy ||
                isUploadingAttachment ||
                isSending
              }
              accessibilityRole="button"
              accessibilityLabel={
                recording
                  ? t('chat.send_voice_recording')
                  : t('chat.start_voice_recording')
              }
            >
              <Feather
                name={recording ? 'send' : 'mic'}
                size={20}
                color={recording ? theme.colors.white : theme.colors.textMuted}
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={t('chat.type_message')}
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
              accessibilityLabel={t('chat.message_input')}
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
              accessibilityLabel={t('chat.send_message')}
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
