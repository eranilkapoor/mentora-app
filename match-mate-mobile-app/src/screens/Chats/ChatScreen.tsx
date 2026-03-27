import React, { useState, useCallback, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// ─── Constants ────────────────────────────────────────────────────────────────

const RED = '#D32F2F';
const RED_LIGHT = '#FDECEA';
const RED_DARK = '#B71C1C';
const BUBBLE_ME = '#FDECEA';
const BUBBLE_YOU = '#F1F3F6';

const EMOJIS = ['😀', '😂', '❤️', '👍', '😍', '🙏', '🎉', '😊'];

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  ChatScreen: { partnerId: string; partnerName: string; partnerPhoto?: string };
  ProfileDetails: { userId: string };
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'ChatScreen'>;
};

type Message = {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
  type: 'text' | 'image';
};

interface BubbleProps {
  item: Message;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<BubbleProps> = ({ item }) => {
  const isMe = item.senderId === 'me';

  return (
    <View
      style={[styles.messageRow, isMe ? styles.rightAlign : styles.leftAlign]}
    >
      <View
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
      >
        {item.type === 'image' && item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <Text style={[styles.messageText, isMe && styles.myText]}>
            {item.text}
          </Text>
        )}
        <Text style={[styles.time, isMe && styles.timeMe]}>
          {formatTime(item.timestamp)}
          {isMe && <Text style={styles.readTick}> ✓✓</Text>}
        </Text>
      </View>
    </View>
  );
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const fetchMessages = (pId: string): Message[] => [
  {
    id: '1',
    senderId: 'me',
    text: 'Hi, nice to connect! 😊',
    timestamp: Date.now() - 60000,
    type: 'text',
  },
  {
    id: '2',
    senderId: pId,
    text: 'Hello! Same here. Looking forward to getting to know you.',
    timestamp: Date.now() - 30000,
    type: 'text',
  },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatScreen({ navigation, route }: Props) {
  const { partnerId, partnerName, partnerPhoto } = route.params ?? {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      setMessages(fetchMessages(partnerId ?? 'partner'));
    }, [partnerId])
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText.trim(),
      timestamp: Date.now(),
      type: 'text',
    };
    setMessages((prev) => [msg, ...prev]);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      const msg: Message = {
        id: Date.now().toString(),
        senderId: 'me',
        imageUrl: result.assets[0].uri,
        timestamp: Date.now(),
        type: 'image',
      };
      setMessages((prev) => [msg, ...prev]);
    }
  };

  const appendEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <MessageBubble item={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: partnerPhoto ?? 'https://i.pravatar.cc/150?img=12' }}
            style={styles.headerAvatar}
          />
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{partnerName ?? 'Chat'}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDotInline} />
            <Text style={styles.headerSub}>Online now</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewProfileBtn}
          onPress={() =>
            navigation.navigate('ProfileDetails', { userId: partnerId ?? '' })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.viewProfileText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        {/* ── Messages ── */}
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Emoji picker ── */}
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

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            onPress={() => setShowEmojiPicker((v) => !v)}
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>📷</Text>
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor="#AAA"
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendBtn,
              inputText.trim().length > 0 && styles.sendBtnActive,
            ]}
            activeOpacity={0.85}
            disabled={!inputText.trim()}
          >
            <Text
              style={[
                styles.sendText,
                inputText.trim().length > 0 && styles.sendTextActive,
              ]}
            >
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  backBtn: { paddingHorizontal: 4 },
  backArrow: { fontSize: 30, color: '#1A1A1A', lineHeight: 32 },

  avatarWrapper: { position: 'relative' },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EEE',
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#66BB6A',
    borderWidth: 2,
    borderColor: '#fff',
  },

  headerInfo: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDotInline: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#66BB6A',
  },
  headerSub: { fontSize: 11, color: '#66BB6A', fontWeight: '600' },

  viewProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: RED,
  },
  viewProfileText: { color: RED, fontWeight: '700', fontSize: 12 },

  // Messages
  messagesList: { paddingHorizontal: 12, paddingVertical: 14 },

  messageRow: { marginVertical: 3 },
  leftAlign: { alignItems: 'flex-start' },
  rightAlign: { alignItems: 'flex-end' },

  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: BUBBLE_ME,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: BUBBLE_YOU,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 14, color: '#222', lineHeight: 20 },
  myText: { color: RED_DARK },
  image: { width: 200, height: 200, borderRadius: 10 },
  time: { fontSize: 10, color: '#AAA', alignSelf: 'flex-end', marginTop: 4 },
  timeMe: { color: '#BBBBBB' },
  readTick: { fontSize: 10, color: RED, fontWeight: '700' },

  // Emoji picker
  emojiBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  emojiBtn: { padding: 6 },
  emoji: { fontSize: 26 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    gap: 6,
  },
  iconBtn: { paddingBottom: 9 },
  iconText: { fontSize: 22 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FAFAFA',
    fontSize: 14,
    color: '#1A1A1A',
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendBtnActive: {
    backgroundColor: RED,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendText: { fontSize: 16, color: '#AAA' },
  sendTextActive: { color: '#fff' },
});
