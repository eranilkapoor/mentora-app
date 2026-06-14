import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
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
        <SettingsCard
          icon="file-text"
          title={t('terms.title')}
          subtitle={t('terms.last_updated')}
        >
          <View style={styles.legalIntro}>
            <Text style={styles.paragraph}>{t('terms.intro')}</Text>
          </View>

          {SECTION_KEYS.map((key, index) => (
            <View
              key={key}
              style={[
                styles.legalRow,
                index === SECTION_KEYS.length - 1 && styles.legalRowLast,
              ]}
            >
              <Text style={styles.legalNumber}>{index + 1}</Text>
              <View style={styles.legalContent}>
                <Text style={styles.legalTitle}>
                  {t(`terms.sections.${key}.title`)}
                </Text>
                <Text style={styles.legalBody}>
                  {t(`terms.sections.${key}.body`)}
                </Text>
              </View>
            </View>
          ))}
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
