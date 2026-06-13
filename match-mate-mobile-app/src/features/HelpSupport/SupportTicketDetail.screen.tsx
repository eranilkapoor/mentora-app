import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { showError, showSuccess } from '@/core/utils/toast';
import {
  SettingsNavigationProp,
  SettingsStackParamList,
} from '@/navigation/types';
import { RouteProp } from '@react-navigation/native';
import {
  SupportTicketMessage,
  useCloseSupportTicketMutation,
  useGetSupportTicketQuery,
  useReplyToSupportTicketMutation,
} from '@/store/services/supportApi.service';
import { useTranslation } from 'react-i18next';
import { supportTicketsStyles } from './SupportTickets.styles';

type Props = {
  navigation: SettingsNavigationProp;
  route: RouteProp<SettingsStackParamList, 'SupportTicketDetail'>;
};

const formatDateTime = (value?: string): string =>
  value ? new Date(value).toLocaleString() : 'Recently';

function MessageCard({ item }: { item: SupportTicketMessage }) {
  const styles = useThemedStyles(supportTicketsStyles);
  const isUser = item.authorType === 'user';
  return (
    <View style={[styles.messageCard, isUser && styles.messageCardUser]}>
      <Text style={styles.messageAuthor}>
        {isUser ? 'You' : item.authorType}
      </Text>
      <Text style={styles.messageBody}>{item.message}</Text>
      <Text style={styles.messageTime}>{formatDateTime(item.createdAt)}</Text>
    </View>
  );
}

export default function SupportTicketDetailScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const styles = useThemedStyles(supportTicketsStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const ticketId = route.params.ticketId;
  const { data, isLoading, isFetching, refetch } =
    useGetSupportTicketQuery(ticketId);
  const [reply, setReply] = useState('');
  const [replyToTicket, { isLoading: isReplying }] =
    useReplyToSupportTicketMutation();
  const [closeTicket, { isLoading: isClosing }] =
    useCloseSupportTicketMutation();

  const ticket = data?.success ? data.data : undefined;
  const isClosed = ticket?.status === 'closed';
  const canReply = reply.trim().length >= 2 && !isReplying && !isClosed;

  const handleReply = async () => {
    if (!canReply) return;
    try {
      const result = await replyToTicket({
        ticketId,
        message: reply.trim(),
      }).unwrap();
      if (result.success) {
        setReply('');
        showSuccess({ title: t('settings.support_tickets.reply_added') });
      }
    } catch {
      showError({
        title: t('settings.support_tickets.reply_failed'),
        message: t('settings.support_tickets.try_again'),
      });
    }
  };

  const handleClose = async () => {
    try {
      const result = await closeTicket(ticketId).unwrap();
      if (result.success) {
        showSuccess({ title: t('settings.support_tickets.closed') });
      }
    } catch {
      showError({
        title: t('settings.support_tickets.close_failed'),
        message: t('settings.support_tickets.try_again'),
      });
    }
  };

  if (isLoading && !ticket) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.support_tickets.detail_title')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {ticket ? (
          <>
            <View style={styles.headerCard}>
              <View style={styles.rowTop}>
                <Text style={styles.headerTitle}>{ticket.subject}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ticket.status}</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                {ticket.category} · {ticket.priority} priority · Created{' '}
                {formatDateTime(ticket.createdAt)}
              </Text>
              {!isClosed ? (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    void handleClose();
                  }}
                  disabled={isClosing}
                  accessibilityRole="button"
                >
                  <Text style={styles.closeButtonText}>
                    {isClosing
                      ? t('settings.support_tickets.closing')
                      : t('settings.support_tickets.close_ticket')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {ticket.messages.map((message, index) => (
              <MessageCard
                key={`${message.createdAt ?? index}-${index}`}
                item={message}
              />
            ))}

            {!isClosed ? (
              <View style={styles.formCard}>
                <Text style={styles.label}>
                  {t('settings.support_tickets.reply')}
                </Text>
                <TextInput
                  value={reply}
                  onChangeText={setReply}
                  placeholder={t('settings.support_tickets.reply_placeholder')}
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.input, styles.textArea]}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !canReply && styles.primaryButtonDisabled,
                  ]}
                  onPress={() => {
                    void handleReply();
                  }}
                  disabled={!canReply}
                  accessibilityRole="button"
                >
                  <Feather name="send" size={15} color={theme.colors.white} />
                  <Text style={styles.primaryButtonText}>
                    {isReplying
                      ? t('settings.support_tickets.sending')
                      : t('settings.support_tickets.send_reply')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                {t('settings.support_tickets.closed_message')}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>
            {t('settings.support_tickets.not_found')}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
