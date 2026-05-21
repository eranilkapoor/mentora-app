import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
  Linking,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  WHATSAPP_NUMBER,
} from '../../core/constants';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { helpSupportStyles } from './HelpSupport.styles';
import { ContactItem, HelpSupportScreenProps } from './HelpSupport.types';
import { FAQ_DATA } from './HelpSupport.constants';
import { FaqCard } from './components/FaqCard';
import { ContactRow } from './components/ContactRow';
import Header from '@/core/components/Header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

// ─── Android LayoutAnimation ──────────────────────────────────────────────────
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HelpSupportScreen({
  navigation,
}: HelpSupportScreenProps): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === index ? null : index));
  }, []);

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
        {/* ── Header Card ──────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconWrapper}>
            <Feather name="life-buoy" size={22} color={theme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            We're here to help! Reach out to us or browse the FAQs below.
          </Text>
        </View>

        {/* ── Contact Card ─────────────────────────────────────────── */}
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

        {/* ── FAQ Card ─────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Feather
                name="help-circle"
                size={13}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          {FAQ_DATA.map((faq, index) => (
            <FaqCard
              key={faq.question}
              faq={faq}
              index={index}
              expanded={expanded === index}
              onToggle={toggleFaq}
              isLast={index === FAQ_DATA.length - 1}
            />
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
