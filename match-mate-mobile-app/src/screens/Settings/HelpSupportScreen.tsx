import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
  Linking,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../core/constants/colors';
import { type RootNavigationProp } from '../../navigation/types';
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  WHATSAPP_NUMBER,
} from '../../core/constants';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { helpSupportStyles } from './HelpSupportScreen.styles';

// ─── Android LayoutAnimation ──────────────────────────────────────────────────

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface HelpSupportScreenProps {
  navigation: RootNavigationProp;
}

interface FaqItem {
  question: string;
  answer: string;
  icon: string;
}

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  action: () => void;
  iconColor?: string;
  isLast?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FAQ_DATA: FaqItem[] = [
  {
    icon: 'user',
    question: 'How do I create or update my profile?',
    answer:
      'Go to Profile → Edit Profile. Add clear photos and complete all sections for better match recommendations.',
  },
  {
    icon: 'heart',
    question: 'How does MatchMate find matches?',
    answer:
      'Our algorithm recommends matches based on your preferences such as age, location, education, interests, and other profile parameters.',
  },
  {
    icon: 'shield',
    question: 'Is my information safe?',
    answer:
      'Yes. We use secure servers, encrypted data transfer, and strict privacy policies to protect your personal information.',
  },
  {
    icon: 'trash-2',
    question: 'How do I delete my account?',
    answer:
      'Go to Settings → Account → Delete Account. Once deleted, your data will be removed within standard retention timelines.',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FaqCard({
  faq,
  index,
  expanded,
  onToggle,
  isLast,
}: {
  faq: FaqItem;
  index: number;
  expanded: boolean;
  onToggle: (i: number) => void;
  isLast: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);

  return (
    <View style={[styles.faqContainer, isLast && styles.faqContainerLast]}>
      <TouchableOpacity
        onPress={() => onToggle(index)}
        style={[styles.faqHeader, expanded && styles.faqHeaderActive]}
        accessibilityRole="button"
        accessibilityLabel={faq.question}
        accessibilityState={{ expanded }}
      >
        <View
          style={[
            styles.faqIconWrapper,
            expanded && styles.faqIconWrapperActive,
          ]}
        >
          <Feather
            name={faq.icon}
            size={13}
            color={expanded ? Colors.primary : Colors.textMuted}
          />
        </View>
        <Text
          style={[
            styles.faqQuestion,
            expanded && styles.faqQuestionActive,
          ]}
        >
          {faq.question}
        </Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={expanded ? Colors.primary : Colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
    </View>
  );
}

function ContactRow({
  icon,
  label,
  value,
  action,
  iconColor,
  isLast,
}: ContactItem): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);

  return (
    <TouchableOpacity
      style={[styles.contactRow, isLast && styles.contactRowLast]}
      onPress={action}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <View style={styles.contactIconWrapper}>
        <Feather
          name={icon}
          size={18}
          color={iconColor ?? Colors.textSecondary}
        />
      </View>
      <View style={styles.contactTextWrapper}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Feather name="chevron-right" size={15} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HelpSupportScreen({}: HelpSupportScreenProps): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === index ? null : index));
  }, []);

  const openEmail = useCallback(
    () => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`),
    [],
  );
  const openPhone = useCallback(
    () => void Linking.openURL(`tel:${SUPPORT_PHONE}`),
    [],
  );
  const openWhatsApp = useCallback(
    () =>
      void Linking.openURL(
        `https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I need help with MatchMate.`,
      ),
    [],
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
      iconColor: Colors.whatsapp,
      isLast: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Card ──────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconWrapper}>
            <Feather name="life-buoy" size={22} color={Colors.primary} />
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
              <Feather name="phone" size={13} color={Colors.primary} />
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
              <Feather name="help-circle" size={13} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>
              Frequently Asked Questions
            </Text>
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