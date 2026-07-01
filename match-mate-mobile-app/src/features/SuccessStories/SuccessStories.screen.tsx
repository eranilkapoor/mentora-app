import React, { useState } from 'react';
import {
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

export default function SuccessStoriesScreen({
  navigation,
}: {
  navigation: SettingsNavigationProp;
}): React.ReactElement {
  const styles = useThemedStyles(successStoriesStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SuccessStoryDraft>(EMPTY_DRAFT);
  const { data, isLoading } = useGetMySuccessStoriesQuery({
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>
            {t('settings.success_stories.share_title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('settings.success_stories.share_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          {(['title', 'partnerName', 'marriageDate', 'location'] as const).map(
            (field) => (
              <View key={field}>
                <Text style={styles.label}>
                  {t(`settings.success_stories.${field}`)}
                </Text>
                <TextInput
                  style={styles.input}
                  value={draft[field] ?? ''}
                  onChangeText={(value) => update(field, value)}
                  placeholder={t(
                    `settings.success_stories.${field}_placeholder`
                  )}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                />
              </View>
            )
          )}
          <Text style={styles.label}>
            {t('settings.success_stories.story')}
          </Text>
          <TextInput
            style={[styles.input, styles.storyInput]}
            value={draft.story}
            onChangeText={(value) => update('story', value)}
            placeholder={t('settings.success_stories.story_placeholder')}
            placeholderTextColor={theme.colors.inputPlaceholder}
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
            <Feather
              name={draft.publicationConsent ? 'check-square' : 'square'}
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.consentText}>
              {t('settings.success_stories.consent')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            disabled={!canSubmit}
            onPress={() => void handleSubmit()}
            accessibilityRole="button"
          >
            <Feather name="send" size={16} color={theme.colors.white} />
            <Text style={styles.buttonText}>
              {isSubmitting
                ? t('settings.success_stories.submitting')
                : t('settings.success_stories.submit')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.historyTitle}>
          {t('settings.success_stories.history')}
        </Text>
        {stories.length ? (
          stories.map((item) => (
            <View key={item._id} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.storyTitle}>{item.title}</Text>
                <Text style={styles.status}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.storyMeta}>
                {item.partnerName} · {item.marriageDate.slice(0, 10)}
              </Text>
              {item.rejectionReason ? (
                <Text style={styles.reason}>{item.rejectionReason}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            {t('settings.success_stories.empty')}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
