import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import {
  useGetLocalizationSettingsQuery,
} from '@/store/services/localizationSettings.service';
import Loader from '@/core/components/Loader';
import { LocalizationSettingsScreenProps } from './LocalizationSettings.types';

export default function LocalizationSettingsScreen({
  navigation,
}: LocalizationSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();
  const { data, isLoading } = useGetLocalizationSettingsQuery();

  const settings = data?.localization;

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.localization.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language */}
        <SettingsCard
          icon="globe"
          title={t('settings.localization.language')}
          subtitle={t('settings.localization.language_subtitle')}
        >
          <SettingsSelectItem
            icon="message-square"
            label={t('settings.localization.app_language')}
            value={settings?.appLanguage?.toUpperCase() ?? 'ENGLISH'}
            onPress={() => {}}
          />
          <SettingsSelectItem
            icon="list"
            label={t('settings.localization.preferred_languages')}
            value={`${settings?.preferredLanguages?.length ?? 0} selected`}
            isLast
            onPress={() => {}}
          />
        </SettingsCard>

        {/* Region */}
        <SettingsCard
          icon="map-pin"
          title={t('settings.localization.region')}
          subtitle={t('settings.localization.region_subtitle')}
        >
          <SettingsSelectItem
            icon="map"
            label={t('settings.localization.region_label')}
            value={settings?.region ?? 'Global'}
            onPress={() => {}}
          />
          <SettingsSelectItem
            icon="clock"
            label={t('settings.localization.timezone')}
            value={settings?.timezone ?? 'UTC'}
            isLast
            onPress={() => {}}
          />
        </SettingsCard>

        {/* Format */}
        <SettingsCard
          icon="calendar"
          title={t('settings.localization.format')}
          subtitle={t('settings.localization.format_subtitle')}
        >
          <SettingsSelectItem
            icon="calendar"
            label={t('settings.localization.date_format')}
            value={settings?.dateFormat === 'DD/MM/YYYY'
              ? 'DD/MM/YYYY'
              : settings?.dateFormat === 'MM/DD/YYYY'
                ? 'MM/DD/YYYY'
                : 'YYYY-MM-DD'}
            onPress={() => {}}
          />
          <SettingsSelectItem
            icon="dollar-sign"
            label={t('settings.localization.currency')}
            value={settings?.currency?.toUpperCase() ?? 'INR'}
            isLast
            onPress={() => {}}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}