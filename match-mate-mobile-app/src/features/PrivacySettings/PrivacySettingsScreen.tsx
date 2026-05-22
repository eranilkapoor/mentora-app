import React, { useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
} from '@/store/services/privacySettings.service';
import Loader from '@/core/components/Loader';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { PrivacySettingsScreenProps } from './PrivacySettings.types';

export default function PrivacySettingsScreen({
  navigation,
}: PrivacySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetPrivacySettingsQuery();
  const [updatePrivacySettings] = useUpdatePrivacySettingsMutation();

  const settings = data?.privacy;

  const handleToggle = useCallback(
    async (key: string, value: boolean) => {
      try {
        await updatePrivacySettings({
          [key]: value,
        }).unwrap();
      } catch (error) {
        console.error('Privacy Update Error:', error);
      }
    },
    [updatePrivacySettings]
  );

  if (isLoading || !settings) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        title={t('settings.privacy.title')}
        onBackPress={navigation.goBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Visibility */}
        <SettingsCard
          icon="eye"
          title={t('settings.privacy.profile_visibility')}
          subtitle={t('settings.privacy.profile_visibility_subtitle')}
        >
          <SettingsSelectItem
            icon="globe"
            label={t('settings.privacy.who_can_see')}
            value={settings.profileVisibility ?? 'everyone'}
            onPress={() => {}}
          />
          <SettingsToggleItem
            icon="user-x"
            label={t('settings.privacy.incognito')}
            sublabel={t('settings.privacy.incognito_sub')}
            value={settings.incognitoMode ?? false}
            onChange={(v) => handleToggle('incognitoMode', v)}
          />
          <SettingsToggleItem
            icon="star"
            label={t('settings.privacy.premium_only')}
            sublabel={t('settings.privacy.premium_only_sub')}
            value={settings.showOnlyToPremium ?? false}
            isLast
            onChange={(v) => handleToggle('showOnlyToPremium', v)}
          />
        </SettingsCard>

        {/* Contact Info */}
        <SettingsCard
          icon="phone"
          title={t('settings.privacy.contact_info')}
          subtitle={t('settings.privacy.contact_info_subtitle')}
        >
          <SettingsToggleItem
            icon="phone"
            label={t('settings.privacy.show_phone')}
            value={settings.showPhone ?? false}
            onChange={(v) => handleToggle('showPhone', v)}
          />
          <SettingsToggleItem
            icon="mail"
            label={t('settings.privacy.show_email')}
            value={settings.showEmail ?? false}
            onChange={(v) => handleToggle('showEmail', v)}
          />
          <SettingsToggleItem
            icon="dollar-sign"
            label={t('settings.privacy.show_income')}
            value={settings.showIncome ?? false}
            onChange={(v) => handleToggle('showIncome', v)}
          />
          <SettingsToggleItem
            icon="calendar"
            label={t('settings.privacy.show_exact_age')}
            value={settings.showExactAge ?? false}
            isLast
            onChange={(v) => handleToggle('showExactAge', v)}
          />
        </SettingsCard>

        {/* Photos */}
        <SettingsCard
          icon="camera"
          title={t('settings.privacy.photos')}
          subtitle={t('settings.privacy.photos_subtitle')}
        >
          <SettingsSelectItem
            icon="image"
            label={t('settings.privacy.show_photos_to')}
            value={settings.showPhotosTo ?? 'everyone'}
            onPress={() => {}}
          />
          <SettingsToggleItem
            icon="eye-off"
            label={t('settings.privacy.blur_photos')}
            sublabel={t('settings.privacy.blur_photos_sub')}
            value={settings.blurPhotosForUnmatched ?? false}
            onChange={(v) => handleToggle('blurPhotosForUnmatched', v)}
          />
          <SettingsToggleItem
            icon="scissors"
            label={t('settings.privacy.allow_screenshots')}
            value={settings.allowScreenshots ?? false}
            isLast
            onChange={(v) => handleToggle('allowScreenshots', v)}
          />
        </SettingsCard>

        {/* Online Presence */}
        <SettingsCard
          icon="activity"
          title={t('settings.privacy.online_presence')}
          subtitle={t('settings.privacy.online_presence_subtitle')}
        >
          <SettingsToggleItem
            icon="circle"
            label={t('settings.privacy.show_online_status')}
            value={settings.showOnlineStatus ?? false}
            onChange={(v) => handleToggle('showOnlineStatus', v)}
          />
          <SettingsSelectItem
            icon="clock"
            label={t('settings.privacy.show_last_seen')}
            value={settings.showLastSeen ?? 'everyone'}
            isLast
            onPress={() => {}}
          />
        </SettingsCard>

        {/* Messaging */}
        <SettingsCard
          icon="message-circle"
          title={t('settings.privacy.messaging')}
          subtitle={t('settings.privacy.messaging_subtitle')}
        >
          <SettingsSelectItem
            icon="send"
            label={t('settings.privacy.allow_messages_from')}
            value={settings.allowMessagesFrom ?? 'everyone'}
            isLast
            onPress={() => {}}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}