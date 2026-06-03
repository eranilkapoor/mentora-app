import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { privacyPolicyStyles } from '../PrivacyPolicy/PrivacyPolicy.styles';
import { SettingsNavigationProp } from '@/navigation/types';

type Props = {
  navigation: SettingsNavigationProp;
};

const SECTION_KEYS = ['use', 'profiles', 'payments', 'account', 'safety'];

export default function TermsConditionsScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(privacyPolicyStyles);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.terms_conditions')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('terms.title')}</Text>
          <Text style={styles.updateText}>{t('terms.last_updated')}</Text>
          <Text style={styles.paragraph}>{t('terms.intro')}</Text>

          {SECTION_KEYS.map((key) => (
            <View key={key} style={styles.policySection}>
              <Text style={styles.heading}>
                {t(`terms.sections.${key}.title`)}
              </Text>
              <Text style={styles.paragraph}>
                {t(`terms.sections.${key}.body`)}
              </Text>
            </View>
          ))}

          <View style={styles.footer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
