import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Colors } from '../../constants/colors';
import { type RootNavigationProp } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrivacyPolicyScreenProps {
  navigation: RootNavigationProp;
}

interface SectionItem {
  heading: string;
  subSections?: { title: string; bullets: string[] }[];
  bullets?: string[];
  paragraph?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POLICY_SECTIONS: SectionItem[] = [
  {
    heading: '1. Information We Collect',
    subSections: [
      {
        title: '1.1 Personal Information',
        bullets: [
          'Full Name',
          'Gender',
          'Date of Birth',
          'Marital Status',
          'Phone Number',
          'Email Address',
          'City / Country',
          'Profile Photos',
          'Education & Occupation',
          'Partner Preferences',
        ],
      },
      {
        title: '1.2 Login & Authentication',
        bullets: [
          'Email + Password',
          'Phone Number + OTP',
          'Social Login (Google, Facebook, Apple)',
        ],
      },
      {
        title: '1.3 Usage & Device Information',
        bullets: [
          'Device type',
          'IP address',
          'App interactions',
          'Crash logs',
          'Cookies (on web)',
        ],
      },
      {
        title: '1.4 App Activity',
        bullets: [
          'Profile views',
          'Matches, likes, shortlist',
          'Chat messages (encrypted)',
          'Verification documents',
        ],
      },
    ],
  },
  {
    heading: '2. How We Use Your Information',
    bullets: [
      'Create/manage your account',
      'Match you with other users',
      'Provide chat features',
      'Improve user experience',
      'Prevent fraud',
      'Provide support',
      'Send important notifications',
    ],
  },
  {
    heading: '3. Sharing Your Information',
    bullets: [
      'Service providers',
      'Legal authorities',
      'Other users (limited profile info)',
    ],
  },
  {
    heading: '4. Security',
    paragraph:
      'We use encryption, secure servers, access control, and regular security audits to protect your data.',
  },
  {
    heading: '5. Your Rights',
    bullets: [
      'Access or edit your info',
      'Delete your account',
      'Update visibility settings',
      'Withdraw consent',
    ],
  },
  {
    heading: '6. Contact Us',
    paragraph:
      'Company: Webnza! Infotech / MatchMate\nEmail: support@webnza.com\nWebsite: www.webnza.com\nAddress: New Delhi',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function BulletList({ items }: { items: string[] }): React.ReactElement {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function PolicySection({
  section,
}: {
  section: SectionItem;
}): React.ReactElement {
  return (
    <View style={styles.policySection}>
      <Text style={styles.heading}>{section.heading}</Text>

      {section.paragraph !== undefined && (
        <Text style={styles.paragraph}>{section.paragraph}</Text>
      )}

      {section.bullets !== undefined && <BulletList items={section.bullets} />}

      {section.subSections?.map((sub) => (
        <View key={sub.title}>
          <Text style={styles.subHeading}>{sub.title}</Text>
          <BulletList items={sub.bullets} />
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PrivacyPolicyScreen({}: PrivacyPolicyScreenProps): React.ReactElement {
  return (
    <SafeAreaProvider style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Privacy Policy — MatchMate</Text>
          <Text style={styles.updateText}>Last updated: 1st January 2026</Text>

          <Text style={styles.paragraph}>
            MatchMate ("we", "our", "us") is committed to protecting your
            personal information and your right to privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use the MatchMate Mobile Application and
            Website.
          </Text>

          {POLICY_SECTIONS.map((section) => (
            <PolicySection key={section.heading} section={section} />
          ))}

          <View style={styles.footer} />
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.textPrimary,
  },
  updateText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  policySection: {
    marginTop: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: Colors.textSecondary,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textBody,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingRight: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textBody,
  },
  footer: {
    height: 24,
  },
});
