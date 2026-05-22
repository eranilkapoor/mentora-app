import React, { useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import {
  useGetAccessibilitySettingsQuery,
  useUpdateAccessibilitySettingsMutation,
} from '@/store/services/accessibilitySettings.service';
import Loader from '@/core/components/Loader';
import { AccessibilitySettingsScreenProps } from './AccessibilitySettings.types';

export default function AccessibilitySettingsScreen({
  navigation,
}: AccessibilitySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetAccessibilitySettingsQuery();
  const [update] = useUpdateAccessibilitySettingsMutation();

  const settings = data?.accessibility;

  const handleToggle = useCallback(
    (key: string, value: boolean) => {
      void update({ [key]: value });
    },
    [update]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.accessibility.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Text */}
        <SettingsCard
          icon="type"
          title={t('settings.accessibility.text')}
          subtitle={t('settings.accessibility.text_subtitle')}
        >
          <SettingsSelectItem
            icon="type"
            label={t('settings.accessibility.font_size')}
            value={settings?.fontSize ?? 'medium'}
            onPress={() => {}}
          />
          <SettingsToggleItem
            icon="bold"
            label={t('settings.accessibility.bold_text')}
            sublabel={t('settings.accessibility.bold_text_sub')}
            value={settings?.boldText ?? false}
            isLast
            onChange={(v) => handleToggle('boldText', v)}
          />
        </SettingsCard>

        {/* Display */}
        <SettingsCard
          icon="monitor"
          title={t('settings.accessibility.display')}
          subtitle={t('settings.accessibility.display_subtitle')}
        >
          <SettingsToggleItem
            icon="sun"
            label={t('settings.accessibility.high_contrast')}
            sublabel={t('settings.accessibility.high_contrast_sub')}
            value={settings?.highContrastMode ?? false}
            onChange={(v) => handleToggle('highContrastMode', v)}
          />
          <SettingsToggleItem
            icon="wind"
            label={t('settings.accessibility.reduce_animations')}
            sublabel={t('settings.accessibility.reduce_animations_sub')}
            value={settings?.reduceAnimations ?? false}
            isLast
            onChange={(v) => handleToggle('reduceAnimations', v)}
          />
        </SettingsCard>

        {/* Screen Reader */}
        <SettingsCard
          icon="headphones"
          title={t('settings.accessibility.screen_reader')}
          subtitle={t('settings.accessibility.screen_reader_subtitle')}
        >
          <SettingsToggleItem
            icon="headphones"
            label={t('settings.accessibility.screen_reader_optimized')}
            sublabel={t('settings.accessibility.screen_reader_optimized_sub')}
            value={settings?.screenReaderOptimized ?? false}
            isLast
            onChange={(v) => handleToggle('screenReaderOptimized', v)}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}