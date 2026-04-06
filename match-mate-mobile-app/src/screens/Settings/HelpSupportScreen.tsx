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

// ─── Android LayoutAnimation setup ───────────────────────────────────────────

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
}

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  action: () => void;
  iconColor?: string;
}

interface FaqCardProps {
  faq: FaqItem;
  index: number;
  expanded: boolean;
  onToggle: (index: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FAQ_DATA: FaqItem[] = [
  {
    question: 'How do I create or update my profile?',
    answer:
      'You can edit your profile by going to the Profile section → Edit Profile. Make sure to add clear photos and complete details for better matches.',
  },
  {
    question: 'How does MatchMate find matches?',
    answer:
      'Our algorithm recommends matches based on your preferences such as age, location, education, interests, and other profile parameters.',
  },
  {
    question: 'Is my information safe?',
    answer:
      'Yes. We use secure servers, encrypted data transfer, and strict privacy policies to protect your personal information.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'You can request account deletion from Settings → Account → Delete Account. Once deleted, your data will be removed within standard retention timelines.',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FaqCard({
  faq,
  index,
  expanded,
  onToggle,
}: FaqCardProps): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);

  return (
    <View style={styles.faqContainer}>
      <TouchableOpacity
        onPress={() => onToggle(index)}
        style={styles.faqHeader}
        accessibilityRole="button"
        accessibilityLabel={faq.question}
        accessibilityState={{ expanded }}
      >
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
    </View>
  );
}

function ContactRow({
  icon,
  label,
  action,
  iconColor,
}: ContactItem): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);

  return (
    <TouchableOpacity
      style={styles.contactRow}
      onPress={action}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <View style={styles.contactIconWrapper}>
        <Feather
          name={icon}
          size={20}
          color={iconColor ?? Colors.textSecondary}
        />
      </View>
      <Text style={styles.contactRowText}>{label}</Text>
      <Feather name="chevron-right" size={16} color={Colors.textMuted} />
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

  const openEmail = useCallback((): void => {
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  }, []);

  const openPhone = useCallback((): void => {
    void Linking.openURL(`tel:${SUPPORT_PHONE}`);
  }, []);

  const openWhatsApp = useCallback((): void => {
    void Linking.openURL(
      `https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I need help with MatchMate.`
    );
  }, []);

  const CONTACT_ITEMS: ContactItem[] = [
    {
      icon: 'mail',
      label: SUPPORT_EMAIL,
      value: SUPPORT_EMAIL,
      action: openEmail,
    },
    {
      icon: 'phone',
      label: SUPPORT_PHONE,
      value: SUPPORT_PHONE,
      action: openPhone,
    },
    {
      icon: 'message-circle',
      label: 'Chat with us on WhatsApp',
      value: WHATSAPP_NUMBER,
      action: openWhatsApp,
      iconColor: Colors.whatsapp,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: Colors.backgroundPage }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          We're here to help! Contact us or browse FAQs below.
        </Text>

        {/* Contact Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Support</Text>
          {CONTACT_ITEMS.map((item) => (
            <ContactRow key={item.value} {...item} />
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQ_DATA.map((faq, index) => (
            <FaqCard
              key={faq.question}
              faq={faq}
              index={index}
              expanded={expanded === index}
              onToggle={toggleFaq}
            />
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
