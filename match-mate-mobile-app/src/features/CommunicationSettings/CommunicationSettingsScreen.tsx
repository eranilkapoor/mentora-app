import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import Header from '@/core/components/Header';

import { ToggleRow } from '@/core/components/ToggleRow';

import { useTheme } from '@/core/theme/ThemeProvider';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { communicationSettingsStyles } from './CommunicationSettings.styles';

import { CommunicationSettingsScreenProps } from './CommunicationSettings.types';

import { CommunicationSection } from './components/CommunicationSection';

import { CommunicationSelectRow } from './components/CommunicationSelectRow';

import { AutoReplyInput } from './components/AutoReplyInput';
import { useGetCommunicationSettingsQuery, useUpdateCommunicationSettingsMutation } from '@/store/services/communicationSettingsApi';

export default function CommunicationSettingsScreen({
  navigation,
}: CommunicationSettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(
    communicationSettingsStyles
  );

  const { theme } = useTheme();

  const { data, isLoading } =
    useGetCommunicationSettingsQuery();

  const [updateSettings] =
    useUpdateCommunicationSettingsMutation();

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
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        title="Communication Settings"
        onBackPress={navigation.goBack}
      />

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Feather
              name="message-circle"
              size={24}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Communication Controls
            </Text>

            <Text style={styles.heroSubtitle}>
              Manage messaging, calls,
              receipts and auto replies.
            </Text>
          </View>
        </View>

        <CommunicationSection
          title="Messaging Permissions"
          subtitle="Control who can contact you"
        >
          <CommunicationSelectRow
            label="Who Can Message"
            description="Restrict incoming messages"
            value={settings.whoCanMessage ?? 'Everyone'}
            onPress={() => {}}
          />

          <View style={styles.rowDivider} />

          <CommunicationSelectRow
            label="Who Can Call"
            description="Restrict incoming calls"
            value={settings.whoCanCall ?? 'Everyone'}
            onPress={() => {}}
            isLast
          />
        </CommunicationSection>

        <CommunicationSection
          title="Messaging Features"
          subtitle="Conversation visibility settings"
        >
          <ToggleRow
            label="Show Read Receipts"
            sublabel="Let users know when messages are read"
            value={settings.showReadReceipts ?? true}
            onChange={(v) =>
              handleToggle(
                'showReadReceipts',
                v
              )
            }
          />

          <View style={styles.rowDivider} />

          <ToggleRow
            label="Show Typing Indicator"
            sublabel="Display typing activity"
            value={settings.showTypingIndicator ?? true}
            onChange={(v) =>
              handleToggle(
                'showTypingIndicator',
                v
              )
            }
          />
        </CommunicationSection>

        <CommunicationSection
          title="Calling Preferences"
          subtitle="Voice and video call controls"
        >
          <ToggleRow
            label="Allow Voice Calls"
            value={settings.allowVoiceCalls ?? true}
            onChange={(v) =>
              handleToggle(
                'allowVoiceCalls',
                v
              )
            }
          />

          <View style={styles.rowDivider} />

          <ToggleRow
            label="Allow Video Calls"
            value={settings.allowVideoCalls ?? true}
            onChange={(v) =>
              handleToggle(
                'allowVideoCalls',
                v
              )
            }
          />
        </CommunicationSection>

        <CommunicationSection
          title="Auto Reply"
          subtitle="Automatically reply when unavailable"
        >
          <ToggleRow
            label="Enable Auto Reply"
            value={settings.autoReplyEnabled ?? false}
            onChange={(v) =>
              handleToggle(
                'autoReplyEnabled',
                v
              )
            }
          />

          {settings.autoReplyEnabled ? (
            <>
              <View style={styles.rowDivider} />

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
        </CommunicationSection>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}