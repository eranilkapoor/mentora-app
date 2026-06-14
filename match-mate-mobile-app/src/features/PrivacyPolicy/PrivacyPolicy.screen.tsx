import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { privacyPolicyStyles } from './PrivacyPolicy.styles';
import { PolicySection } from './components/PolicySection';
import { POLICY_SECTIONS } from './PrivacyPolicy.constants';
import Header from '@/core/components/Header';
import { PrivacyPolicyScreenProps } from './PrivacyPolicy.types';
import { useTheme } from '@/core/theme/ThemeProvider';

export default function PrivacyPolicyScreen({
  navigation,
}: PrivacyPolicyScreenProps): React.ReactElement {
  const styles = useThemedStyles(privacyPolicyStyles);
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.backgroundPage }]}
    >
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.privacy_policy')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsCard
          icon="shield"
          title={t('privacy_policy.title')}
          subtitle={t('privacy_policy.last_updated')}
        >
          <View style={styles.legalIntro}>
            <Text style={styles.paragraph}>{t('privacy_policy.intro')}</Text>
          </View>

          {POLICY_SECTIONS.map((section, index) => (
            <PolicySection
              key={section.heading}
              section={section}
              index={index}
              isLast={index === POLICY_SECTIONS.length - 1}
            />
          ))}
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
