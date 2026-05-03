import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { Colors } from '../../core/constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { privacyPolicyStyles } from './PrivacyPolicy.styles';
import { PolicySection } from './components/PolicySection';
import { POLICY_SECTIONS } from './PrivacyPolicy.constants';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PrivacyPolicyScreen(): React.ReactElement {
  const styles = useThemedStyles(privacyPolicyStyles);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: Colors.backgroundPage }]}
    >
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
    </SafeAreaView>
  );
}
