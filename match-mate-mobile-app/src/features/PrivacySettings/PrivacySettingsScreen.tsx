import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import {
  SettingsOption,
  SettingsOptionSheet,
} from '@/core/components/settings/SettingsOptionSheet';
import {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
} from '@/store/services/privacySettings.service';
import Loader from '@/core/components/Loader';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import {
  MessagePermission,
  PrivacySettings,
  PrivacySettingsScreenProps,
  ProfileVisibility,
  VisibilityLevel,
} from './PrivacySettings.types';

type SelectKey =
  | 'profileVisibility'
  | 'showPhotosTo'
  | 'showLastSeen'
  | 'allowMessagesFrom';

const formatValue = <T extends string>(
  options: SettingsOption<T>[],
  value?: T
): string => options.find((option) => option.value === value)?.label ?? '';

export default function PrivacySettingsScreen({
  navigation,
}: PrivacySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetPrivacySettingsQuery();
  const [updatePrivacySettings] = useUpdatePrivacySettingsMutation();
  const [activeSelect, setActiveSelect] = useState<SelectKey | null>(null);

  const settings = data?.privacy;

  const profileVisibilityOptions = useMemo<SettingsOption<ProfileVisibility>[]>(
    () => [
      { value: 'public', label: t('settings.options.public') },
      { value: 'private', label: t('settings.options.private') },
      { value: 'contacts_only', label: t('settings.options.contacts_only') },
      { value: 'premium_only', label: t('settings.options.premium_only') },
    ],
    [t]
  );

  const visibilityOptions = useMemo<SettingsOption<VisibilityLevel>[]>(
    () => [
      { value: 'everyone', label: t('settings.options.everyone') },
      {
        value: 'accepted_matches',
        label: t('settings.options.accepted_matches'),
      },
      { value: 'contacts_only', label: t('settings.options.contacts_only') },
      { value: 'no_one', label: t('settings.options.no_one') },
    ],
    [t]
  );

  const messagePermissionOptions = useMemo<SettingsOption<MessagePermission>[]>(
    () => [
      { value: 'all', label: t('settings.options.everyone') },
      { value: 'matches_only', label: t('settings.options.matches_only') },
      { value: 'contacts_only', label: t('settings.options.contacts_only') },
      { value: 'no_one', label: t('settings.options.no_one') },
    ],
    [t]
  );

  const handleToggle = useCallback(
    async (key: keyof PrivacySettings, value: boolean) => {
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

  const handleUpdate = useCallback(
    async <K extends keyof PrivacySettings>(
      key: K,
      value: PrivacySettings[K]
    ) => {
      try {
        await updatePrivacySettings({ [key]: value }).unwrap();
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
            value={formatValue(
              profileVisibilityOptions,
              settings.profileVisibility
            )}
            onPress={() => setActiveSelect('profileVisibility')}
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
            value={formatValue(visibilityOptions, settings.showPhotosTo)}
            onPress={() => setActiveSelect('showPhotosTo')}
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
            value={formatValue(visibilityOptions, settings.showLastSeen)}
            isLast
            onPress={() => setActiveSelect('showLastSeen')}
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
            value={formatValue(
              messagePermissionOptions,
              settings.allowMessagesFrom
            )}
            isLast
            onPress={() => setActiveSelect('allowMessagesFrom')}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>

      <SettingsOptionSheet
        visible={activeSelect === 'profileVisibility'}
        title={t('settings.privacy.who_can_see')}
        options={profileVisibilityOptions}
        selectedValue={settings.profileVisibility}
        onSelect={(value) => void handleUpdate('profileVisibility', value)}
        onClose={() => setActiveSelect(null)}
      />
      <SettingsOptionSheet
        visible={activeSelect === 'showPhotosTo'}
        title={t('settings.privacy.show_photos_to')}
        options={visibilityOptions}
        selectedValue={settings.showPhotosTo}
        onSelect={(value) => void handleUpdate('showPhotosTo', value)}
        onClose={() => setActiveSelect(null)}
      />
      <SettingsOptionSheet
        visible={activeSelect === 'showLastSeen'}
        title={t('settings.privacy.show_last_seen')}
        options={visibilityOptions}
        selectedValue={settings.showLastSeen}
        onSelect={(value) => void handleUpdate('showLastSeen', value)}
        onClose={() => setActiveSelect(null)}
      />
      <SettingsOptionSheet
        visible={activeSelect === 'allowMessagesFrom'}
        title={t('settings.privacy.allow_messages_from')}
        options={messagePermissionOptions}
        selectedValue={settings.allowMessagesFrom}
        onSelect={(value) => void handleUpdate('allowMessagesFrom', value)}
        onClose={() => setActiveSelect(null)}
      />
    </SafeAreaView>
  );
}
