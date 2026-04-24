import React, { useState, useCallback, useRef } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { EMOJIS } from '../../core/constants';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { chatStyles } from './ChatScreen.styles';

import { fetchMessages, formatDateLabel, Message, Props } from './Chat.types';

import { MessageBubble } from './components/MessageBubble';
import { DateSeparator } from './components/DateSeparator';
import Header from '@/core/components/Header';

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

export default function ChatScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const styles = useThemedStyles(chatStyles);
  const { theme } = useTheme();

  const { userId, partnerName, partnerPhoto } = route.params ?? {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<Message>>(null);

  // ─── Load messages ─────────────────────────
  useFocusEffect(
    useCallback(() => {
      setMessages(fetchMessages(userId ?? 'partner'));
    }, [userId])
  );

  // ─── Send message ─────────────────────────
  const handleSend = useCallback((): void => {
    if (!inputText.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText.trim(),
      timestamp: Date.now(),
      type: 'text',
      read: false,
    };

    setMessages((prev) => [msg, ...prev]);
    setInputText('');
    setShowEmojiPicker(false);

    // ✅ scroll to latest
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [inputText]);

  // ─── Pick image ───────────────────────────
  const handlePickImage = useCallback(async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] !== undefined) {
      const msg: Message = {
        id: Date.now().toString(),
        senderId: 'me',
        imageUrl: result.assets[0].uri,
        timestamp: Date.now(),
        type: 'image',
        read: false,
      };

      setMessages((prev) => [msg, ...prev]);
    }
  }, []);

  // ─── Emoji ────────────────────────────────
  const appendEmoji = useCallback((emoji: string): void => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  // ─── Render message ───────────────────────
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ─── HEADER (NEW) ───────────────────── */}
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={partnerName ?? 'Chat'}
        subtitle="Online now"
        avatarUri={partnerPhoto ?? 'https://i.pravatar.cc/150?img=12'}
        actions={[
          {
            icon: 'phone',
            onPress: () => {},
            accessibilityLabel: 'Voice call',
          },
          {
            icon: 'video',
            onPress: () => {},
            accessibilityLabel: 'Video call',
          },
          {
            icon: 'more-vertical',
            onPress: () => {
              // TODO: open bottom sheet (profile, block, report)
            },
            accessibilityLabel: 'More options',
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* ─── Messages ─────────────────────── */}
        <FlatList
          ref={listRef}
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <DateSeparator
              ts={messages[messages.length - 1]?.timestamp ?? Date.now()}
            />
          }
        />

        {/* ─── Emoji Picker ─────────────────── */}
        {showEmojiPicker && (
          <View style={styles.emojiBox}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => appendEmoji(e)}
                style={styles.emojiBtn}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ─── Input Bar ────────────────────── */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            onPress={() => setShowEmojiPicker((v) => !v)}
            style={styles.iconBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open emoji picker"
          >
            <Feather
              name="smile"
              size={20}
              color={
                showEmojiPicker ? theme.colors.primary : theme.colors.textMuted
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void handlePickImage()}
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
            placeholder="Type a message…"
            placeholderTextColor={theme.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            blurOnSubmit={false}
            accessibilityLabel="Message input"
          />

          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendBtn,
              inputText.trim().length > 0 && styles.sendBtnActive,
            ]}
            activeOpacity={0.85}
            disabled={!inputText.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Feather
              name="send"
              size={18}
              color={
                inputText.trim().length > 0
                  ? theme.colors.white
                  : theme.colors.textMuted
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
