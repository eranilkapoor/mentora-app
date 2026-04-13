import React, { useState, useCallback, useRef } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
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
import { chatStyles } from './ChatScreen.styles';
import { Colors } from '../../core/constants/colors';
import { fetchMessages, formatDateLabel, Message, Props } from './Chat.types';
import { MessageBubble } from './components/MessageBubble';
import { DateSeparator } from './components/DateSeparator';

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ChatScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const styles = useThemedStyles(chatStyles);
  const { userId, partnerName, partnerPhoto } = route.params ?? {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      setMessages(fetchMessages(userId ?? 'partner'));
    }, [userId])
  );

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
  }, [inputText]);

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

  const appendEmoji = useCallback((emoji: string): void => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item, index }) => (
      <>
        <MessageBubble item={item} />
        {/* Show date separator between days */}
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
      {/* ── Header ───────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() =>
            navigation.navigate('ProfileDetails', { userId: userId ?? '' })
          }
        >
          <Image
            source={{
              uri: partnerPhoto ?? 'https://i.pravatar.cc/150?img=12',
            }}
            style={styles.headerAvatar}
          />
          <View style={styles.onlineDot} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {partnerName ?? 'Chat'}
          </Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDotInline} />
            <Text style={styles.headerSub}>Online now</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            accessibilityRole="button"
            accessibilityLabel="Voice call"
          >
            <Feather name="phone" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() =>
              navigation.navigate('ProfileDetails', { userId: userId ?? '' })
            }
            accessibilityRole="button"
          >
            <Text style={styles.viewProfileText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        {/* ── Messages ─────────────────────────────────────────────── */}
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <DateSeparator
              ts={messages[messages.length - 1]?.timestamp ?? Date.now()}
            />
          }
        />

        {/* ── Emoji Picker ─────────────────────────────────────────── */}
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

        {/* ── Input Bar ────────────────────────────────────────────── */}
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
              color={showEmojiPicker ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void handlePickImage()}
            style={styles.iconBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Send image"
          >
            <Feather name="image" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={handleSend}
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
                inputText.trim().length > 0 ? Colors.white : Colors.textMuted
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
