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
      label: t('settings.support_center.email_support'),
      value: SUPPORT_EMAIL,
      action: openEmail,
    },
    {
      icon: 'phone',
      label: t('settings.support_center.call_us'),
      value: SUPPORT_PHONE,
      action: openPhone,
    },
    {
      icon: 'message-circle',
      label: t('settings.support_center.whatsapp'),
      value: t('settings.support_center.whatsapp_sub'),
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
          <Text style={styles.headerTitle}>
            {t('settings.support_center.title')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('settings.support_center.subtitle')}
          </Text>
        </View>

        <SettingsCard
          icon="book-open"
          title={t('settings.support_center.resources')}
          subtitle={t('settings.support_center.resources_sub')}
        >
          <SettingsSelectItem
            icon="life-buoy"
            label={t('settings.support_tickets.title')}
            sublabel={t('settings.support_tickets.entry_sub')}
            onPress={() => navigation.navigate('SupportTickets')}
          />
          <SettingsSelectItem
            icon="heart"
            label={t('settings.success_stories.title')}
            sublabel={t('settings.success_stories.entry_sub')}
            onPress={() => navigation.navigate('SuccessStories')}
          />
          <SettingsSelectItem
            icon="help-circle"
            label={t('settings.support_center.faqs')}
            sublabel={t('settings.support_center.faqs_sub')}
            onPress={() => navigation.navigate('Faqs')}
          />
          <SettingsSelectItem
            icon="shield"
            label={t('settings.support_center.community_guidelines')}
            sublabel={t('settings.support_center.community_guidelines_sub')}
            onPress={() => navigation.navigate('CommunityGuidelines')}
          />
          <SettingsSelectItem
            icon="file-text"
            label={t('settings.support_center.terms')}
            sublabel={t('settings.support_center.terms_sub')}
            onPress={() => navigation.navigate('TermsConditions')}
          />
          <SettingsSelectItem
            icon="lock"
            label={t('settings.support_center.privacy')}
            sublabel={t('settings.support_center.privacy_sub')}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            isLast
          />
        </SettingsCard>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Feather name="phone" size={13} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('settings.support_center.contact_support')}
            </Text>
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
