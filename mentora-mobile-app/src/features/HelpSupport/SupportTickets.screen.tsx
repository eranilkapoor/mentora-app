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
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { showError, showSuccess } from '@/core/utils/toast';
import { SettingsNavigationProp } from '@/navigation/types';
import {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
  useCreateSupportTicketMutation,
  useGetSupportTicketsQuery,
} from '@/store/services/supportApi.service';
import { useTranslation } from 'react-i18next';
import { supportTicketsStyles } from './SupportTickets.styles';
import {
  buildSupportTicketRequest,
  isSupportTicketDraftValid,
} from './SupportTickets.utils';

type Props = {
  navigation: SettingsNavigationProp;
};

const categories: SupportTicketCategory[] = [
  'account',
  'billing',
  'classes',
  'ai_tutor',
  'schedules',
  'progress',
  'chat',
  'safety',
  'technical',
  'other',
];

const priorities: SupportTicketPriority[] = ['normal', 'high', 'urgent'];

type Translate = (key: string, options?: Record<string, unknown>) => string;

const translateTicketValue = (
  t: Translate,
  group: 'categories' | 'priorities' | 'statuses',
  value: string
): string =>
  t(`settings.support_tickets.${group}.${value}`, {
    defaultValue: value.replace(/_/g, ' '),
  });

const formatDate = (value: string | undefined, t: Translate): string =>
  value
    ? new Date(value).toLocaleDateString()
    : t('settings.support_tickets.recently');

function ChoiceChip<T extends string>({
  value,
  selected,
  onPress,
  label,
}: {
  value: T;
  selected: boolean;
  onPress: (value: T) => void;
  label: string;
}) {
  const styles = useThemedStyles(supportTicketsStyles);
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={() => onPress(value)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TicketRow({
  ticket,
  isLast,
  onPress,
}: {
  ticket: SupportTicket;
  isLast: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(supportTicketsStyles);
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.ticketRow, isLast && styles.ticketRowLast]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.rowTop}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {ticket.subject}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {translateTicketValue(t, 'statuses', ticket.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.rowMeta}>
        {translateTicketValue(t, 'categories', ticket.category)} �{' '}
        {t('settings.support_tickets.priority_value', {
          priority: translateTicketValue(t, 'priorities', ticket.priority),
        })}{' '}
        � {t('settings.support_tickets.updated')}{' '}
        {formatDate(ticket.updatedAt, t)}
      </Text>
    </TouchableOpacity>
  );
}

export default function SupportTicketsScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(supportTicketsStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading, isFetching, refetch } = useGetSupportTicketsQuery({
    page: 1,
    limit: 20,
  });
  const [createTicket, { isLoading: isSubmitting }] =
    useCreateSupportTicketMutation();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('account');
  const [priority, setPriority] = useState<SupportTicketPriority>('normal');

  const tickets = data?.success ? data.data.items : [];
  const draft = { subject, message, category, priority };
  const canSubmit = isSupportTicketDraftValid(draft) && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      showError({
        title: t('settings.support_tickets.invalid_title'),
        message: t('settings.support_tickets.invalid_message'),
      });
      return;
    }

    try {
      const result = await createTicket(
        buildSupportTicketRequest(draft)
      ).unwrap();

      if (result.success) {
        setSubject('');
        setMessage('');
        setCategory('account');
        setPriority('normal');
        showSuccess({ title: t('settings.support_tickets.created') });
        navigation.navigate('SupportTicketDetail', {
          ticketId: result.data._id,
        });
      }
    } catch {
      showError({
        title: t('settings.support_tickets.create_failed'),
        message: t('settings.support_tickets.try_again'),
      });
    }
  };

  if (isLoading && !data) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.support_tickets.title')}
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
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {t('settings.support_tickets.create_title')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('settings.support_tickets.create_subtitle')}
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>
            {t('settings.support_tickets.subject')}
          </Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={t('settings.support_tickets.subject_placeholder')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>
            {t('settings.support_tickets.category')}
          </Text>
          <View style={styles.chipRow}>
            {categories.map((item) => (
              <ChoiceChip
                key={item}
                value={item}
                label={translateTicketValue(t, 'categories', item)}
                selected={category === item}
                onPress={setCategory}
              />
            ))}
          </View>

          <Text style={styles.label}>
            {t('settings.support_tickets.priority')}
          </Text>
          <View style={styles.chipRow}>
            {priorities.map((item) => (
              <ChoiceChip
                key={item}
                value={item}
                label={translateTicketValue(t, 'priorities', item)}
                selected={priority === item}
                onPress={setPriority}
              />
            ))}
          </View>

          <Text style={styles.label}>
            {t('settings.support_tickets.message')}
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('settings.support_tickets.message_placeholder')}
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              !canSubmit && styles.primaryButtonDisabled,
            ]}
            onPress={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
            accessibilityRole="button"
          >
            <Feather name="send" size={15} color={theme.colors.white} />
            <Text style={styles.primaryButtonText}>
              {isSubmitting
                ? t('settings.support_tickets.submitting')
                : t('settings.support_tickets.submit')}
            </Text>
          </TouchableOpacity>
        </View>

        <SettingsCard
          title={t('settings.support_tickets.my_tickets')}
          subtitle={t('settings.support_tickets.my_tickets_sub')}
          icon="life-buoy"
        >
          {tickets.length ? (
            tickets.map((ticket, index) => (
              <TicketRow
                key={ticket._id}
                ticket={ticket}
                isLast={index === tickets.length - 1}
                onPress={() =>
                  navigation.navigate('SupportTicketDetail', {
                    ticketId: ticket._id,
                  })
                }
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('settings.support_tickets.empty')}
            </Text>
          )}
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}
