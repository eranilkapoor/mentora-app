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
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { showError, showSuccess } from '@/core/utils/toast';
import type { SettingsNavigationProp } from '@/navigation/types';
import {
  useGetMySuccessStoriesQuery,
  useSubmitSuccessStoryMutation,
} from '@/store/services/successStoryApi.service';
import { successStoriesStyles } from './SuccessStories.styles';
import {
  getSuccessStoryStatusMeta,
  isSuccessStoryDraftValid,
  normalizeSuccessStoryDraft,
  SuccessStoryDraft,
} from './SuccessStories.utils';

const EMPTY_DRAFT: SuccessStoryDraft = {
  title: '',
  partnerName: '',
  marriageDate: '',
  story: '',
  location: '',
  publicationConsent: false,
};

const formatDate = (value?: string): string =>
  value ? new Date(value).toLocaleDateString() : 'Recently';

const storyFields: Array<{
  key: 'title' | 'partnerName' | 'marriageDate' | 'location';
  labelKey: string;
}> = [
  { key: 'title', labelKey: 'settings.success_stories.story_title' },
  { key: 'partnerName', labelKey: 'settings.success_stories.partnerName' },
  { key: 'marriageDate', labelKey: 'settings.success_stories.marriageDate' },
  { key: 'location', labelKey: 'settings.success_stories.location' },
];

export default function SuccessStoriesScreen({
  navigation,
}: {
  navigation: SettingsNavigationProp;
}): React.ReactElement {
  const styles = useThemedStyles(successStoriesStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SuccessStoryDraft>(EMPTY_DRAFT);
  const { data, isLoading, isFetching, refetch } = useGetMySuccessStoriesQuery({
    page: 1,
    limit: 20,
  });
  const [submit, { isLoading: isSubmitting }] = useSubmitSuccessStoryMutation();

  const update = <K extends keyof SuccessStoryDraft>(
    key: K,
    value: SuccessStoryDraft[K]
  ): void => setDraft((current) => ({ ...current, [key]: value }));
  const canSubmit = isSuccessStoryDraftValid(draft) && !isSubmitting;
  const stories = data?.success ? data.data.items : [];

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) {
      showError({
        title: t('settings.success_stories.invalid_title'),
        message: t('settings.success_stories.invalid_message'),
      });
      return;
    }
    try {
      await submit(normalizeSuccessStoryDraft(draft)).unwrap();
      setDraft(EMPTY_DRAFT);
      showSuccess({ title: t('settings.success_stories.submitted') });
    } catch {
      showError({
        title: t('settings.success_stories.failed'),
        message: t('settings.support_tickets.try_again'),
      });
    }
  };

  if (isLoading && !data) return <Loader />;

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.success_stories.title')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
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
            {t('settings.success_stories.share_title')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('settings.success_stories.share_subtitle')}
          </Text>
        </View>

        <View style={styles.formCard}>
          {storyFields.map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>{t(field.labelKey)}</Text>
              <TextInput
                style={styles.input}
                value={draft[field.key] ?? ''}
                onChangeText={(value) => update(field.key, value)}
                placeholder={t(
                  `settings.success_stories.${field.key}_placeholder`
                )}
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          ))}
          <Text style={styles.label}>
            {t('settings.success_stories.story')}
          </Text>
          <TextInput
            style={[styles.input, styles.storyInput]}
            value={draft.story}
            onChangeText={(value) => update('story', value)}
            placeholder={t('settings.success_stories.story_placeholder')}
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() =>
              update('publicationConsent', !draft.publicationConsent)
            }
            accessibilityRole="checkbox"
            accessibilityState={{ checked: draft.publicationConsent }}
          >
            <View
              style={[
                styles.consentCheckbox,
                draft.publicationConsent && styles.consentCheckboxActive,
              ]}
            >
              <Feather
                name={draft.publicationConsent ? 'check' : 'square'}
                size={14}
                color={
                  draft.publicationConsent
                    ? theme.colors.primary
                    : theme.colors.textMuted
                }
              />
            </View>
            <Text style={styles.consentText}>
              {t('settings.success_stories.consent')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !canSubmit && styles.primaryButtonDisabled,
            ]}
            disabled={!canSubmit}
            onPress={() => void handleSubmit()}
            accessibilityRole="button"
          >
            <Feather name="send" size={16} color={theme.colors.white} />
            <Text style={styles.primaryButtonText}>
              {isSubmitting
                ? t('settings.success_stories.submitting')
                : t('settings.success_stories.submit')}
            </Text>
          </TouchableOpacity>
        </View>

        <SettingsCard
          title={t('settings.success_stories.history')}
          subtitle={t('settings.success_stories.entry_sub')}
          icon="heart"
        >
          {stories.length ? (
            stories.map((item, index) =>
              (() => {
                const statusMeta = getSuccessStoryStatusMeta(item.status);

                return (
                  <View
                    key={item._id}
                    style={[
                      styles.storyRow,
                      index === stories.length - 1 && styles.storyRowLast,
                    ]}
                  >
                    <View style={styles.rowTop}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          statusMeta.tone === 'success' && styles.badgeSuccess,
                          statusMeta.tone === 'warning' && styles.badgeWarning,
                          statusMeta.tone === 'muted' && styles.badgeMuted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            statusMeta.tone === 'success' &&
                              styles.badgeTextSuccess,
                            statusMeta.tone === 'warning' &&
                              styles.badgeTextWarning,
                            statusMeta.tone === 'muted' &&
                              styles.badgeTextMuted,
                          ]}
                        >
                          {t(statusMeta.labelKey)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.rowMeta}>
                      {item.partnerName} · {formatDate(item.marriageDate)}
                    </Text>
                    {item.location ? (
                      <Text style={styles.rowMeta}>{item.location}</Text>
                    ) : null}
                    <Text
                      style={[
                        styles.statusNoteText,
                        item.rejectionReason &&
                          item.status === 'rejected' &&
                          styles.rejectionNoteText,
                      ]}
                    >
                      {item.rejectionReason && item.status === 'rejected'
                        ? item.rejectionReason
                        : t(statusMeta.noteKey)}
                    </Text>
                  </View>
                );
              })()
            )
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="heart" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitleText}>
                {t('settings.success_stories.empty_title')}
              </Text>
              <Text style={styles.emptyText}>
                {t('settings.success_stories.empty_message')}
              </Text>
            </View>
          )}
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}
