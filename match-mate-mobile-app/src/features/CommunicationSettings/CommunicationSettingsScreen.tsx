import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsToggleItem } from '@/core/components/settings/SettingsToggleItem';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import {
  useGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
} from '@/store/services/communicationSettings.service';
import Loader from '@/core/components/Loader';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { CommunicationSettingsScreenProps } from './CommunicationSettings.types';
import { AutoReplyInput } from './components/AutoReplyInput';

export default function CommunicationSettingsScreen({
  navigation,
}: CommunicationSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();

  const { data, isLoading } = useGetCommunicationSettingsQuery();
  const [updateSettings] = useUpdateCommunicationSettingsMutation();

  const settings = data?.communication;

  const [autoReplyMessage, setAutoReplyMessage] =
    useState(
      settings?.autoReplyMessage ?? ''
    );

  const handleToggle = useCallback(
    async (key: string, value: boolean) => {
      try {
        await updateSettings({
          [key]: value,
        }).unwrap();
      } catch (error) {
        console.error(
          'Communication Settings Error:',
          error
        );
      }
    },
    [updateSettings]
  );

  const handleUpdate = useCallback(
    async (
      key: string,
      value: string
    ) => {
      try {
        await updateSettings({
          [key]: value,
        }).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [updateSettings]
  );

  if (isLoading || !settings) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        title={t('settings.communication.title')}
        onBackPress={navigation.goBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Messaging */}
        <SettingsCard
          icon="message-circle"
          title={t('settings.communication.messaging')}
          subtitle={t('settings.communication.messaging_subtitle')}
        >
          <SettingsSelectItem
            icon="send"
            label={t('settings.communication.who_can_message')}
            value={settings?.whoCanMessage ?? 'Everyone'}
            onPress={() => {}}
          />
          <SettingsToggleItem
            icon="check-circle"
            label={t('settings.communication.read_receipts')}
            sublabel={t('settings.communication.read_receipts_sub')}
            value={settings?.showReadReceipts ?? false}
            onChange={(v) => handleToggle('showReadReceipts', v)}
          />
          <SettingsToggleItem
            icon="edit-2"
            label={t('settings.communication.typing_indicator')}
            sublabel={t('settings.communication.typing_indicator_sub')}
            value={settings?.showTypingIndicator ?? true}
            isLast
            onChange={(v) => handleToggle('showTypingIndicator', v)}
          />
        </SettingsCard>

        {/* Auto Reply */}
        <SettingsCard
          icon="corner-down-right"
          title={t('settings.communication.auto_reply')}
          subtitle={t('settings.communication.auto_reply_subtitle')}
        >
          <SettingsToggleItem
            icon="zap"
            label={t('settings.communication.auto_reply_enabled')}
            sublabel={t('settings.communication.auto_reply_enabled_sub')}
            value={settings?.autoReplyEnabled ?? false}
            isLast
            onChange={(v) => handleToggle('autoReplyEnabled', v)}
          />

          {settings.autoReplyEnabled ? (
            <>
              <AutoReplyInput
                value={autoReplyMessage}
                onChangeText={(text) => {
                  setAutoReplyMessage(text);

                  void handleUpdate(
                    'autoReplyMessage',
                    text
                  );
                }}
              />
            </>
          ) : null}
        </SettingsCard>

        {/* Calls */}
        <SettingsCard
          icon="phone-call"
          title={t('settings.communication.calls')}
          subtitle={t('settings.communication.calls_subtitle')}
        >
          <SettingsSelectItem
            icon="phone"
            label={t('settings.communication.who_can_call')}
            value={settings?.whoCanCall ?? 'Everyone'}
            onPress={() => {}}
          />
          <SettingsToggleItem
            icon="phone-call"
            label={t('settings.communication.voice_calls')}
            value={settings?.allowVoiceCalls ?? true}
            onChange={(v) => handleToggle('allowVoiceCalls', v)}
          />
          <SettingsToggleItem
            icon="video"
            label={t('settings.communication.video_calls')}
            value={settings?.allowVideoCalls ?? true}
            isLast
            onChange={(v) => handleToggle('allowVideoCalls', v)}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}