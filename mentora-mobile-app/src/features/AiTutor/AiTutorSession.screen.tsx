import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { showError } from '@/core/utils/toast';
import { AiTutorSessionRouteProp, AppNavigationProp } from '@/navigation/types';
import {
  AiTutorMessage,
  useGetAiTutorSessionQuery,
  useSendAiTutorMessageMutation,
} from '@/store/services/learningApi.service';

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join('\n')
        : data.message;
    }
  }
  return 'Something went wrong. Please try again.';
};

const getMessageId = (message: AiTutorMessage): string =>
  message.id ?? message._id ?? `${message.sender}-${message.createdAt ?? ''}`;

export default function AiTutorSessionScreen(): React.ReactElement {
  const { theme } = useTheme();
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<AiTutorSessionRouteProp>();
  const { sessionId } = route.params;

  const {
    data: sessionDetail,
    isFetching,
    isError,
    refetch,
  } = useGetAiTutorSessionQuery({ sessionId });
  const [sendMessage, { isLoading: sending }] = useSendAiTutorMessageMutation();
  const [draft, setDraft] = useState('');

  const messages = sessionDetail?.data?.messages ?? [];

  const handleSend = async (): Promise<void> => {
    const content = draft.trim();
    if (!content || sending) return;
    setDraft('');
    try {
      await sendMessage({ sessionId, content }).unwrap();
    } catch (error) {
      showError({
        title: 'Message not sent',
        message: extractErrorMessage(error),
      });
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.backgroundPage },
      ]}
      edges={['top', 'bottom']}
    >
      <Header
        title="AI Tutor"
        subtitle={sessionDetail?.data?.session.status ?? 'Session'}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isFetching && messages.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerState}>
          <Text style={[styles.errorText, { color: theme.colors.textMuted }]}>
            Unable to load this session.
          </Text>
          <Pressable
            style={[styles.retryButton, { borderColor: theme.colors.divider }]}
            onPress={() => refetch()}
          >
            <Text style={{ color: theme.colors.primary }}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={getMessageId}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isStudent = item.sender === 'student';
            return (
              <View
                style={[
                  styles.bubble,
                  isStudent ? styles.studentBubble : styles.tutorBubble,
                  {
                    backgroundColor: isStudent
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: theme.colors.divider,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    {
                      color: isStudent
                        ? theme.colors.white
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {item.content}
                </Text>
                {item.safetyStatus !== 'allowed' ? (
                  <Text
                    style={[styles.safetyNote, { color: theme.colors.warning }]}
                  >
                    Flagged for review by Mentora safety rules
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.divider,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask your AI tutor..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
          <Pressable
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => void handleSend()}
            disabled={sending || !draft.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Feather name="send" size={18} color={theme.colors.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageList: {
    padding: 16,
    gap: 10,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  studentBubble: {
    alignSelf: 'flex-end',
  },
  tutorBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  safetyNote: {
    marginTop: 4,
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
