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
  useGetMediaSettingsQuery,
  useUpdateMediaSettingsMutation,
} from '@/store/services/mediaSettings.service';
import Loader from '@/core/components/Loader';
import { MediaSettingsScreenProps } from './MediaSettings.types';

export default function MediaSettingsScreen({
  navigation,
}: MediaSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetMediaSettingsQuery();
  const [updateMediaSettings] = useUpdateMediaSettingsMutation();

  const settings = data?.media;

  const handleToggle = useCallback(
    (key: string, value: boolean) => {
      void updateMediaSettings({ [key]: value });
    },
    [updateMediaSettings]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.media.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Playback */}
        <SettingsCard
          icon="play-circle"
          title={t('settings.media.playback')}
          subtitle={t('settings.media.playback_subtitle')}
        >
          <SettingsToggleItem
            icon="play"
            label={t('settings.media.video_autoplay')}
            sublabel={t('settings.media.video_autoplay_sub')}
            value={settings?.videoAutoplay ?? false}
            onChange={(v) => handleToggle('videoAutoplay', v)}
          />
          <SettingsSelectItem
            icon="sliders"
            label={t('settings.media.media_quality')}
            value={settings?.mediaQuality ?? 'medium'}
            isLast
            onPress={() => {}}
          />
        </SettingsCard>

        {/* Photos */}
        <SettingsCard
          icon="image"
          title={t('settings.media.photos')}
          subtitle={t('settings.media.photos_subtitle')}
        >
          <SettingsToggleItem
            icon="download"
            label={t('settings.media.auto_download')}
            sublabel={t('settings.media.auto_download_sub')}
            value={settings?.autoDownloadPhotos ?? false}
            onChange={(v) => handleToggle('autoDownloadPhotos', v)}
          />
          <SettingsToggleItem
            icon="eye-off"
            label={t('settings.media.blur_private')}
            sublabel={t('settings.media.blur_private_sub')}
            value={settings?.blurPrivatePhotos ?? false}
            onChange={(v) => handleToggle('blurPrivatePhotos', v)}
          />
          <SettingsToggleItem
            icon="grid"
            label={t('settings.media.show_in_gallery')}
            sublabel={t('settings.media.show_in_gallery_sub')}
            value={settings?.showMediaInGallery ?? false}
            isLast
            onChange={(v) => handleToggle('showMediaInGallery', v)}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}