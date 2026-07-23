import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  useGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
} from '@/store/services/communicationSettingsApi.service';
import Loader from '@/core/components/Loader';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import {
  CommunicationPermission,
  CommunicationSettings,
  CommunicationSettingsScreenProps,
} from './CommunicationSettings.types';
import { AutoReplyInput } from './components/AutoReplyInput';
import { usePlanFeatureAccess } from '../Membership/hooks/usePlanFeatureAccess';
import { useUpgradePrompt } from '../Membership/hooks/useUpgradePrompt';

type SelectKey = 'whoCanMessage' | 'whoCanCall';

const FEATURE_AUTO_REPLY = 'auto_reply';
const FEATURE_VOICE_CALL = 'voice_call';
const FEATURE_VIDEO_CALL = 'video_call';

const formatValue = <T extends string>(
  options: SettingsOption<T>[],
  value?: T
): string => options.find((option) => option.value === value)?.label ?? '';

export default function CommunicationSettingsScreen({
  navigation,
}: CommunicationSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { t } = useTranslation();
  const showUpgradePrompt = useUpgradePrompt();

  const { data, isLoading } = useGetCommunicationSettingsQuery();
  const [updateSettings] = useUpdateCommunicationSettingsMutation();
  const { hasFeature: canUseAutoReply, isLoading: autoReplyFeatureLoading } =
    usePlanFeatureAccess(FEATURE_AUTO_REPLY);
  const { hasFeature: canUseVoiceCalls, isLoading: voiceCallFeatureLoading } =
    usePlanFeatureAccess(FEATURE_VOICE_CALL);
  const { hasFeature: canUseVideoCalls, isLoading: videoCallFeatureLoading } =
    usePlanFeatureAccess(FEATURE_VIDEO_CALL);

  const settings = data?.communication;
  const [activeSelect, setActiveSelect] = useState<SelectKey | null>(null);
  const featureLoading =
    autoReplyFeatureLoading ||
    voiceCallFeatureLoading ||
    videoCallFeatureLoading;
  const restrictedHint = t('settings.communication.plan_restricted', {
    defaultValue: 'Upgrade your plan to use this communication option.',
  });

  const [autoReplyMessage, setAutoReplyMessage] = useState(
    settings?.autoReplyMessage ?? ''
  );

  useEffect(() => {
    setAutoReplyMessage(settings?.autoReplyMessage ?? '');
  }, [settings?.autoReplyMessage]);

  const permissionOptions = useMemo<SettingsOption<CommunicationPermission>[]>(
    () => [
      { value: 'all', label: t('settings.options.everyone') },
      {
        value: 'scheduled_sessions_only',
        label: t('settings.options.scheduled_sessions_only'),
      },
      { value: 'contacts_only', label: t('settings.options.contacts_only') },
      { value: 'no_one', label: t('settings.options.no_one') },
    ],
    [t]
  );

  const handleToggle = useCallback(
    async (key: keyof CommunicationSettings, value: boolean) => {
      try {
        await updateSettings({
          [key]: value,
        }).unwrap();
      } catch (error) {
        console.error('Communication Settings Error:', error);
      }
    },
    [updateSettings]
  );

  const handleUpdate = useCallback(
    async <K extends keyof CommunicationSettings>(
      key: K,
      value: CommunicationSettings[K]
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

  const saveAutoReplyMessage = useCallback(() => {
    if (autoReplyMessage !== (settings?.autoReplyMessage ?? '')) {
      void handleUpdate('autoReplyMessage', autoReplyMessage);
    }
  }, [autoReplyMessage, handleUpdate, settings?.autoReplyMessage]);

  if (isLoading || featureLoading || !settings) {
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
            sublabel={t('settings.communication.who_can_message_sub', {
              defaultValue:
                'Choose who can start or continue conversations with you.',
            })}
            value={formatValue(permissionOptions, settings?.whoCanMessage)}
            onPress={() => setActiveSelect('whoCanMessage')}
          />
          <SettingsToggleItem
            icon="check-circle"
            label={t('settings.communication.read_receipts')}
            sublabel={t('settings.communication.read_receipts_sub')}
            value={settings?.showReadReceipts ?? false}
            onChange={(v) => {
              void handleToggle('showReadReceipts', v);
            }}
          />
          <SettingsToggleItem
            icon="edit-2"
            label={t('settings.communication.typing_indicator')}
            sublabel={t('settings.communication.typing_indicator_sub')}
            value={settings?.showTypingIndicator ?? true}
            isLast
            onChange={(v) => {
              void handleToggle('showTypingIndicator', v);
            }}
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
            sublabel={
              canUseAutoReply
                ? t('settings.communication.auto_reply_enabled_sub')
                : restrictedHint
            }
            value={canUseAutoReply && (settings?.autoReplyEnabled ?? false)}
            disabled={!canUseAutoReply}
            onDisabledPress={() =>
              showUpgradePrompt(t('settings.communication.auto_reply'))
            }
            isLast
            onChange={(v) => {
              if (canUseAutoReply) void handleToggle('autoReplyEnabled', v);
            }}
          />

          {canUseAutoReply && settings.autoReplyEnabled ? (
            <>
              <AutoReplyInput
                value={autoReplyMessage}
                onChangeText={setAutoReplyMessage}
                onSubmitEditing={saveAutoReplyMessage}
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
            sublabel={t('settings.communication.who_can_call_sub', {
              defaultValue:
                'Choose who can request voice or video calls with you.',
            })}
            value={formatValue(permissionOptions, settings?.whoCanCall)}
            disabled={!canUseVoiceCalls && !canUseVideoCalls}
            onDisabledPress={() =>
              showUpgradePrompt(t('settings.communication.calls'))
            }
            onPress={() => {
              if (canUseVoiceCalls || canUseVideoCalls) {
                setActiveSelect('whoCanCall');
              }
            }}
          />
          <SettingsToggleItem
            icon="phone-call"
            label={t('settings.communication.voice_calls')}
            sublabel={
              canUseVoiceCalls
                ? t('settings.communication.voice_calls_sub', {
                    defaultValue:
                      'Allow voice calls from approved tutors or contacts who match your call permission.',
                  })
                : restrictedHint
            }
            value={canUseVoiceCalls && (settings?.allowVoiceCalls ?? true)}
            disabled={!canUseVoiceCalls}
            onDisabledPress={() =>
              showUpgradePrompt(t('settings.communication.voice_calls'))
            }
            onChange={(v) => {
              if (canUseVoiceCalls) void handleToggle('allowVoiceCalls', v);
            }}
          />
          <SettingsToggleItem
            icon="video"
            label={t('settings.communication.video_calls')}
            sublabel={
              canUseVideoCalls
                ? t('settings.communication.video_calls_sub', {
                    defaultValue:
                      'Allow video calls from approved tutors or contacts who match your call permission.',
                  })
                : restrictedHint
            }
            value={canUseVideoCalls && (settings?.allowVideoCalls ?? true)}
            disabled={!canUseVideoCalls}
            onDisabledPress={() =>
              showUpgradePrompt(t('settings.communication.video_calls'))
            }
            isLast
            onChange={(v) => {
              if (canUseVideoCalls) void handleToggle('allowVideoCalls', v);
            }}
          />
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>

      <SettingsOptionSheet
        visible={activeSelect === 'whoCanMessage'}
        title={t('settings.communication.who_can_message')}
        options={permissionOptions}
        selectedValue={settings.whoCanMessage}
        onSelect={(value) => void handleUpdate('whoCanMessage', value)}
        onClose={() => setActiveSelect(null)}
      />
      <SettingsOptionSheet
        visible={activeSelect === 'whoCanCall'}
        title={t('settings.communication.who_can_call')}
        options={permissionOptions}
        selectedValue={settings.whoCanCall}
        onSelect={(value) => void handleUpdate('whoCanCall', value)}
        onClose={() => setActiveSelect(null)}
      />
    </SafeAreaView>
  );
}
