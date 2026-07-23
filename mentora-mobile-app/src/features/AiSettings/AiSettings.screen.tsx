import React, { useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import {
  useGetAiSettingsQuery,
  useUpdateAiSettingsMutation,
} from '@/store/services/aiSettingsApi.service';
import Loader from '@/core/components/Loader';
import { AiSettingsScreenProps } from './AiSettings.types';

export default function AiSettingsScreen({
  navigation,
}: AiSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetAiSettingsQuery();
  const [updateAiSettings] = useUpdateAiSettingsMutation();

  const settings = data?.ai;

  const handleToggle = useCallback(
    (key: string, value: boolean) => {
      void updateAiSettings({ [key]: value });
    },
    [updateAiSettings]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.ai.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI tutoring */}
        <SettingsCard
          icon="cpu"
          title={t('settings.ai.tutoring')}
          subtitle={t('settings.ai.tutoring_subtitle')}
        >
          <SettingsToggleItem
            icon="zap"
            label={t('settings.ai.recommendations')}
            sublabel={t('settings.ai.recommendations_sub')}
            value={settings?.aiRecommendationsEnabled ?? false}
            onChange={(v) => handleToggle('aiRecommendationsEnabled', v)}
          />
          <SettingsToggleItem
            icon="activity"
            label={t('settings.ai.smart_ranking')}
            sublabel={t('settings.ai.smart_ranking_sub')}
            value={settings?.adaptiveTutorRanking ?? false}
            onChange={(v) => handleToggle('adaptiveTutorRanking', v)}
          />
          <SettingsToggleItem
            icon="star"
            label={t('settings.ai.compatibility_scoring')}
            sublabel={t('settings.ai.compatibility_scoring_sub')}
            value={settings?.progressScoring ?? false}
            onChange={(v) => handleToggle('progressScoring', v)}
          />
          <SettingsToggleItem
            icon="moon"
            label={t('settings.ai.study_plan_suggestions')}
            sublabel={t('settings.ai.study_plan_suggestions_sub')}
            value={settings?.studyPlanSuggestions ?? false}
            isLast
            onChange={(v) => handleToggle('studyPlanSuggestions', v)}
          />
        </SettingsCard>

        {/* Profile AI */}
        <SettingsCard
          icon="user-check"
          title={t('settings.ai.profile')}
          subtitle={t('settings.ai.profile_subtitle')}
        >
          <SettingsToggleItem
            icon="edit-3"
            label={t('settings.ai.bio_generation')}
            sublabel={t('settings.ai.bio_generation_sub')}
            value={settings?.allowAiProfileSummary ?? false}
            onChange={(v) => handleToggle('allowAiProfileSummary', v)}
          />
          <SettingsToggleItem
            icon="database"
            label={t('settings.ai.use_profile_data')}
            sublabel={t('settings.ai.use_profile_data_sub')}
            value={settings?.useProfileDataForPersonalization ?? false}
            isLast
            onChange={(v) =>
              handleToggle('useProfileDataForPersonalization', v)
            }
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
