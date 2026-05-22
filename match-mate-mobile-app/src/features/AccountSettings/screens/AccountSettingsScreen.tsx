import React from 'react';

import { ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/core/components/Header';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { ToggleRow } from '@/core/components/ToggleRow';

import { showConfirm } from '@/core/utils/confirm';

import { accountSettingsStyles } from '../styles/accountSettings.styles';

import { useAccountSettings } from '../hooks/useAccountSettings';

import { VerificationCard } from '../components/VerificationCard';

import { LinkedAccountCard } from '../components/LinkedAccountCard';

import { DangerZoneCard } from '../components/DangerZoneCard';

import { SettingsSection } from '../components/SettingsSection';

export default function AccountSettingsScreen(): React.ReactElement {
  const styles = useThemedStyles(accountSettingsStyles);

  const { settings, toggleTwoFactor } = useAccountSettings();

  // if (!settings) {
  //     return <></>;
  // }

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Account Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          title="Verification"
          subtitle="Manage your verification status"
        >
          <VerificationCard
            icon="mail"
            title="Email Verification"
            description="Secure your account with verified email"
            verified={settings?.emailVerified ?? false}
          />

          <VerificationCard
            icon="phone"
            title="Phone Verification"
            description="Verify your phone number"
            verified={settings?.phoneVerified ?? false}
          />
        </SettingsSection>
        <SettingsSection title="Security" subtitle="Protect your account">
          <ToggleRow
            label="Two Factor Authentication"
            sublabel="Extra security for login"
            value={settings?.twoFactorEnabled ?? false}
            onChange={toggleTwoFactor}
            enableRowPress
          />
        </SettingsSection>
        <SettingsSection
          title="Connected Accounts"
          subtitle="Manage linked social accounts"
        >
          {settings?.linkedAccounts?.map((account) => (
            <LinkedAccountCard
              key={account.provider}
              provider={account.provider}
              connected={account.connected}
              onConnect={() => {
                console.log('connect', account.provider);
              }}
              onDisconnect={() => {
                console.log('disconnect', account.provider);
              }}
            />
          ))}
        </SettingsSection>
        <SettingsSection
          title="Danger Zone"
          subtitle="Sensitive account actions"
        >
          <DangerZoneCard
            title="Deactivate Account"
            description="Temporarily disable your account"
            buttonText="Deactivate"
            onPress={() => {
              showConfirm({
                title: 'Deactivate Account',
                message: 'Are you sure you want to deactivate account?',
                destructive: true,
                onConfirm: () => {
                  console.log('deactivate');
                },
              });
            }}
          />

          <DangerZoneCard
            title="Delete Account"
            description="Your account will be permanently removed"
            buttonText="Delete Account"
            destructive
            onPress={() => {
              showConfirm({
                title: 'Delete Account',
                message: 'This action cannot be undone.',
                destructive: true,
                onConfirm: () => {
                  console.log('delete');
                },
              });
            }}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
