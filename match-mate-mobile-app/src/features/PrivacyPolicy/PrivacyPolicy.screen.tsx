import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
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
        <View style={styles.card}>
          <Text style={styles.title}>{t('privacy_policy.title')}</Text>
          <Text style={styles.updateText}>
            {t('privacy_policy.last_updated')}
          </Text>

          <Text style={styles.paragraph}>{t('privacy_policy.intro')}</Text>

          {POLICY_SECTIONS.map((section) => (
            <PolicySection key={section.heading} section={section} />
          ))}

          <View style={styles.footer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
