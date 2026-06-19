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

type SelectKey = 'whoCanMessage' | 'whoCanCall';

const FEATURE_READ_RECEIPTS = 'read_receipts';
const FEATURE_TYPING_INDICATOR = 'typing_indicator';
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

  const { data, isLoading } = useGetCommunicationSettingsQuery();
  const [updateSettings] = useUpdateCommunicationSettingsMutation();
  const {
    hasFeature: canUseReadReceipts,
    isLoading: readReceiptsFeatureLoading,
  } = usePlanFeatureAccess(FEATURE_READ_RECEIPTS);
  const {
    hasFeature: canUseTypingIndicator,
    isLoading: typingIndicatorFeatureLoading,
  } = usePlanFeatureAccess(FEATURE_TYPING_INDICATOR);
  const { hasFeature: canUseVoiceCalls, isLoading: voiceCallFeatureLoading } =
    usePlanFeatureAccess(FEATURE_VOICE_CALL);
  const { hasFeature: canUseVideoCalls, isLoading: videoCallFeatureLoading } =
    usePlanFeatureAccess(FEATURE_VIDEO_CALL);

  const settings = data?.communication;
  const [activeSelect, setActiveSelect] = useState<SelectKey | null>(null);
  const featureLoading =
    readReceiptsFeatureLoading ||
    typingIndicatorFeatureLoading ||
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
      { value: 'matches_only', label: t('settings.options.matches_only') },
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
            sublabel={
              canUseReadReceipts
                ? t('settings.communication.read_receipts_sub')
                : restrictedHint
            }
            value={canUseReadReceipts && (settings?.showReadReceipts ?? false)}
            disabled={!canUseReadReceipts}
            onChange={(v) => {
              if (canUseReadReceipts) void handleToggle('showReadReceipts', v);
            }}
          />
          <SettingsToggleItem
            icon="edit-2"
            label={t('settings.communication.typing_indicator')}
            sublabel={
              canUseTypingIndicator
                ? t('settings.communication.typing_indicator_sub')
                : restrictedHint
            }
            value={
              canUseTypingIndicator && (settings?.showTypingIndicator ?? true)
            }
            disabled={!canUseTypingIndicator}
            isLast
            onChange={(v) => {
              if (canUseTypingIndicator) {
                void handleToggle('showTypingIndicator', v);
              }
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
            sublabel={t('settings.communication.auto_reply_enabled_sub')}
            value={settings?.autoReplyEnabled ?? false}
            isLast
            onChange={(v) => handleToggle('autoReplyEnabled', v)}
          />

          {settings.autoReplyEnabled ? (
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
                      'Allow voice calls from people who match your call permission.',
                  })
                : restrictedHint
            }
            value={canUseVoiceCalls && (settings?.allowVoiceCalls ?? true)}
            disabled={!canUseVoiceCalls}
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
                      'Allow video calls from people who match your call permission.',
                  })
                : restrictedHint
            }
            value={canUseVideoCalls && (settings?.allowVideoCalls ?? true)}
            disabled={!canUseVideoCalls}
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
