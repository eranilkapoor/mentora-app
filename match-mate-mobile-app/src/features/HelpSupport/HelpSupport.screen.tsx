import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, ScrollView, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  WHATSAPP_NUMBER,
} from '../../core/constants';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { helpSupportStyles } from './HelpSupport.styles';
import { ContactItem, HelpSupportScreenProps } from './HelpSupport.types';
import { ContactRow } from './components/ContactRow';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import Header from '@/core/components/Header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

export default function HelpSupportScreen({
  navigation,
}: HelpSupportScreenProps): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const openEmail = useCallback(
    () => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`),
    []
  );
  const openPhone = useCallback(
    () => void Linking.openURL(`tel:${SUPPORT_PHONE}`),
    []
  );
  const openWhatsApp = useCallback(
    () =>
      void Linking.openURL(
        `https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I need help with MatchMate.`
      ),
    []
  );

  const CONTACT_ITEMS: ContactItem[] = [
    {
      icon: 'mail',
      label: 'Email Support',
      value: SUPPORT_EMAIL,
      action: openEmail,
    },
    {
      icon: 'phone',
      label: 'Call Us',
      value: SUPPORT_PHONE,
      action: openPhone,
    },
    {
      icon: 'message-circle',
      label: 'WhatsApp',
      value: 'Chat with us on WhatsApp',
      action: openWhatsApp,
      iconColor: theme.colors.whatsapp,
      isLast: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.help_and_support')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIconWrapper}>
            <Feather name="life-buoy" size={22} color={theme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            We're here to help. Contact support, review policies, or find quick
            answers in our resource center.
          </Text>
        </View>

        <SettingsCard
          icon="book-open"
          title="Resources"
          subtitle="Support articles, safety guidance, and legal information"
        >
          <SettingsSelectItem
            icon="help-circle"
            label="FAQs"
            sublabel="Common questions about profiles, matches, and payments"
            onPress={() => navigation.navigate('Faqs')}
          />
          <SettingsSelectItem
            icon="shield"
            label="Community Guidelines"
            sublabel="Safety, respect, and profile authenticity rules"
            onPress={() => navigation.navigate('CommunityGuidelines')}
          />
          <SettingsSelectItem
            icon="file-text"
            label="Terms & Conditions"
            sublabel="Service terms for using MatchMate"
            onPress={() => navigation.navigate('TermsConditions')}
          />
          <SettingsSelectItem
            icon="lock"
            label="Privacy Policy"
            sublabel="How profile and account data is handled"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            isLast
          />
        </SettingsCard>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Feather name="phone" size={13} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Contact Support</Text>
          </View>

          {CONTACT_ITEMS.map((item) => (
            <ContactRow key={item.value} {...item} />
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
