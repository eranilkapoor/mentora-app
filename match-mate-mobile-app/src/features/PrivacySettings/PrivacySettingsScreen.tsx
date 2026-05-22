import React, { useCallback } from 'react';

import { View, Text, ScrollView, ActivityIndicator } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';

import Header from '@/core/components/Header';

import { ToggleRow } from '@/core/components/ToggleRow';

import { useTheme } from '@/core/theme/ThemeProvider';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { privacySettingsStyles } from './PrivacySettings.styles';

import { PrivacySettingsScreenProps } from './PrivacySettings.types';

import {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
} from '../../store/services/privacySettingsApi';

import { PrivacySection } from './components/PrivacySection';

import { PrivacySelectRow } from './components/PrivacySelectRow';

export default function PrivacySettingsScreen({
  navigation,
}: PrivacySettingsScreenProps): React.ReactElement {
  const styles = useThemedStyles(privacySettingsStyles);

  const { theme } = useTheme();

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
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        title="Privacy Settings"
        onBackPress={navigation.goBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}

        <View style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Feather name="shield" size={24} color={theme.colors.primary} />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Privacy & Safety</Text>

            <Text style={styles.heroSubtitle}>
              Control profile visibility, media access, online presence and
              messaging permissions.
            </Text>
          </View>
        </View>

        {/* Profile Privacy */}

        <PrivacySection
          title="Profile Privacy"
          subtitle="Control your account visibility"
        >
          <ToggleRow
            label="Incognito Mode"
            sublabel="Browse profiles privately"
            value={settings.incognitoMode}
            onChange={(v) => handleToggle('incognitoMode', v)}
          />

          <View style={styles.rowDivider} />

          <ToggleRow
            label="Premium Only Visibility"
            sublabel="Visible only to premium users"
            value={settings.showOnlyToPremium}
            onChange={(v) => handleToggle('showOnlyToPremium', v)}
          />
        </PrivacySection>

        {/* Personal Information */}

        <PrivacySection
          title="Personal Information"
          subtitle="Manage visible profile details"
        >
          <ToggleRow
            label="Show Phone Number"
            value={settings.showPhone}
            onChange={(v) => handleToggle('showPhone', v)}
          />

          <View style={styles.rowDivider} />

          <ToggleRow
            label="Show Email Address"
            value={settings.showEmail}
            onChange={(v) => handleToggle('showEmail', v)}
          />

          <View style={styles.rowDivider} />

          <ToggleRow
            label="Show Income"
            value={settings.showIncome}
            onChange={(v) => handleToggle('showIncome', v)}
          />

          <View style={styles.rowDivider} />

          <ToggleRow
            label="Show Exact Age"
            value={settings.showExactAge}
            onChange={(v) => handleToggle('showExactAge', v)}
          />
        </PrivacySection>

        {/* Photos */}

        <PrivacySection
          title="Photos & Media"
          subtitle="Manage profile media privacy"
        >
          <ToggleRow
            label="Blur Photos For Unmatched"
            sublabel="Blur images for users who are not matched"
            value={settings.blurPhotosForUnmatched}
            onChange={(v) => handleToggle('blurPhotosForUnmatched', v)}
          />

          <View style={styles.rowDivider} />

          <ToggleRow
            label="Allow Screenshots"
            sublabel="Allow users to take screenshots"
            value={settings.allowScreenshots}
            onChange={(v) => handleToggle('allowScreenshots', v)}
          />

          <View style={styles.rowDivider} />

          <PrivacySelectRow
            label="Who Can View Photos"
            description="Control photo access"
            value={settings.showPhotosTo || 'everyone'}
            onPress={() => {}}
            isLast
          />
        </PrivacySection>

        {/* Online Presence */}

        <PrivacySection
          title="Online Presence"
          subtitle="Manage your activity visibility"
        >
          <ToggleRow
            label="Show Online Status"
            value={settings.showOnlineStatus}
            onChange={(v) => handleToggle('showOnlineStatus', v)}
          />

          <View style={styles.rowDivider} />

          <PrivacySelectRow
            label="Last Seen Visibility"
            description="Choose who can see your activity"
            value={settings.showLastSeen || 'everyone'}
            onPress={() => {}}
            isLast
          />
        </PrivacySection>

        {/* Messaging */}

        <PrivacySection
          title="Messaging & Requests"
          subtitle="Control who can contact you"
        >
          <PrivacySelectRow
            label="Allow Messages From"
            description="Restrict incoming conversations"
            value={settings.allowMessagesFrom || 'everyone'}
            onPress={() => {}}
            isLast
          />
        </PrivacySection>

        {/* Advanced */}

        <PrivacySection
          title="Advanced Privacy"
          subtitle="Additional account privacy settings"
        >
          <PrivacySelectRow
            label="Profile Visibility"
            description="Choose who can discover your profile"
            value={settings.profileVisibility || 'everyone'}
            onPress={() => {}}
            isLast
          />
        </PrivacySection>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
