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
} from '@/store/services/privacySettingsApi.service';
import Loader from '@/core/components/Loader';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import {
  PrivacySettings,
  PrivacySettingsScreenProps,
  ProfileVisibility,
  VisibilityLevel,
} from './PrivacySettings.types';
import { usePlanFeatureAccess } from '../Membership/hooks/usePlanFeatureAccess';
import { useUpgradePrompt } from '../Membership/hooks/useUpgradePrompt';

type SelectKey = 'profileVisibility' | 'showPhotosTo' | 'showLastSeen';

const FEATURE_INCOGNITO_MODE = 'incognito_mode';
const FEATURE_PRIVATE_PHOTOS = 'private_photos';
const FEATURE_SHOW_ONLY_TO_PREMIUM = 'show_only_to_premium';

const formatValue = <T extends string>(
  options: SettingsOption<T>[],
  value?: T
): string => options.find((option) => option.value === value)?.label ?? '';

export default function PrivacySettingsScreen({
  navigation,
}: PrivacySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();
  const showUpgradePrompt = useUpgradePrompt();

  const { data, isLoading } = useGetPrivacySettingsQuery();
  const [updatePrivacySettings] = useUpdatePrivacySettingsMutation();
  const { hasFeature: canUseIncognito, isLoading: incognitoFeatureLoading } =
    usePlanFeatureAccess(FEATURE_INCOGNITO_MODE);
  const {
    hasFeature: canUsePrivatePhotoControls,
    isLoading: privatePhotoFeatureLoading,
  } = usePlanFeatureAccess(FEATURE_PRIVATE_PHOTOS);
  const {
    hasFeature: canShowOnlyToPremium,
    isLoading: showOnlyToPremiumFeatureLoading,
  } = usePlanFeatureAccess(FEATURE_SHOW_ONLY_TO_PREMIUM);
  const [activeSelect, setActiveSelect] = useState<SelectKey | null>(null);

  const settings = data?.privacy;
  const featureLoading =
    incognitoFeatureLoading ||
    privatePhotoFeatureLoading ||
    showOnlyToPremiumFeatureLoading;
  const restrictedHint = t('settings.privacy.plan_restricted', {
    defaultValue: 'Upgrade your plan to use this privacy option.',
  });

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
        value: 'scheduled_sessions',
        label: t('settings.options.scheduled_sessions'),
      },
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

  if (isLoading || featureLoading || !settings) {
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
            sublabel={t('settings.privacy.who_can_see_sub', {
              defaultValue:
                'Choose whether profiles are visible publicly, privately, to approved contacts, or to subscription members where supported.',
            })}
            value={formatValue(
              profileVisibilityOptions,
              settings.profileVisibility
            )}
            onPress={() => setActiveSelect('profileVisibility')}
          />
          <SettingsToggleItem
            icon="user-x"
            label={t('settings.privacy.incognito')}
            sublabel={
              canUseIncognito
                ? t('settings.privacy.incognito_sub')
                : restrictedHint
            }
            value={canUseIncognito && (settings.incognitoMode ?? false)}
            disabled={!canUseIncognito}
            onDisabledPress={() =>
              showUpgradePrompt(t('settings.privacy.incognito'))
            }
            onChange={(v) => {
              if (canUseIncognito) void handleToggle('incognitoMode', v);
            }}
          />
          <SettingsToggleItem
            icon="star"
            label={t('settings.privacy.premium_only')}
            sublabel={
              canShowOnlyToPremium
                ? t('settings.privacy.premium_only_sub')
                : restrictedHint
            }
            value={
              canShowOnlyToPremium && (settings.showOnlyToPremium ?? false)
            }
            disabled={!canShowOnlyToPremium}
            onDisabledPress={() =>
              showUpgradePrompt(t('settings.privacy.premium_only'))
            }
            isLast
            onChange={(v) => {
              if (canShowOnlyToPremium) {
                void handleToggle('showOnlyToPremium', v);
              }
            }}
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
            sublabel={t('settings.privacy.show_phone_sub', {
              defaultValue:
                'When enabled, allowed viewers can see your phone number on your profile.',
            })}
            value={settings.showPhone ?? false}
            onChange={(v) => handleToggle('showPhone', v)}
          />
          <SettingsToggleItem
            icon="mail"
            label={t('settings.privacy.show_email')}
            sublabel={t('settings.privacy.show_email_sub', {
              defaultValue:
                'When enabled, allowed viewers can see your email address.',
            })}
            value={settings.showEmail ?? false}
            onChange={(v) => handleToggle('showEmail', v)}
          />
          <SettingsToggleItem
            icon="dollar-sign"
            label={t('settings.privacy.show_income')}
            sublabel={t('settings.privacy.show_income_sub', {
              defaultValue:
                'Show or hide billing profile details where administrative access is supported.',
            })}
            value={settings.showIncome ?? false}
            onChange={(v) => handleToggle('showIncome', v)}
          />
          <SettingsToggleItem
            icon="calendar"
            label={t('settings.privacy.show_exact_age')}
            sublabel={t('settings.privacy.show_exact_age_sub', {
              defaultValue:
                'Turn off to show an age range instead of your exact age where supported.',
            })}
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
            sublabel={t('settings.privacy.show_photos_to_sub', {
              defaultValue:
                'Choose who can view student avatars without additional approval.',
            })}
            value={formatValue(visibilityOptions, settings.showPhotosTo)}
            onPress={() => setActiveSelect('showPhotosTo')}
          />
          <SettingsToggleItem
            icon="eye-off"
            label={t('settings.privacy.blur_photos')}
            sublabel={
              canUsePrivatePhotoControls
                ? t('settings.privacy.blur_photos_sub')
                : restrictedHint
            }
            value={
              canUsePrivatePhotoControls &&
              (settings.blurPhotosForUnmatched ?? false)
            }
            disabled={!canUsePrivatePhotoControls}
            onDisabledPress={() =>
              showUpgradePrompt(t('settings.privacy.blur_photos'))
            }
            onChange={(v) => {
              if (canUsePrivatePhotoControls) {
                void handleToggle('blurPhotosForUnmatched', v);
              }
            }}
          />
          <SettingsToggleItem
            icon="scissors"
            label={t('settings.privacy.allow_screenshots')}
            sublabel={t('settings.privacy.allow_screenshots_sub', {
              defaultValue:
                'Disable to discourage screenshots where platform protections are available.',
            })}
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
            sublabel={t('settings.privacy.show_online_status_sub', {
              defaultValue:
                'Let others see when you are currently active in the app.',
            })}
            value={settings.showOnlineStatus ?? true}
            onChange={(v) => {
              void handleToggle('showOnlineStatus', v);
            }}
          />
          <SettingsSelectItem
            icon="clock"
            label={t('settings.privacy.show_last_seen')}
            sublabel={t('settings.privacy.show_last_seen_sub', {
              defaultValue:
                'Control who can see the last time you were active.',
            })}
            value={formatValue(visibilityOptions, settings.showLastSeen)}
            isLast
            onPress={() => {
              setActiveSelect('showLastSeen');
            }}
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
    </SafeAreaView>
  );
}
