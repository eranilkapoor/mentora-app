import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { privacyPolicyStyles } from '../PrivacyPolicy/PrivacyPolicy.styles';
import { SettingsNavigationProp } from '@/navigation/types';

type Props = {
  navigation: SettingsNavigationProp;
};

const SECTIONS = [
  {
    title: 'Use of MatchMate',
    body: 'You agree to provide accurate profile information, use the service respectfully, and avoid impersonation, harassment, spam, or unlawful activity.',
  },
  {
    title: 'Profiles and Matches',
    body: 'Match suggestions, compatibility scores, and recommendations are informational. You are responsible for evaluating and communicating with other members safely.',
  },
  {
    title: 'Subscriptions and Payments',
    body: 'Paid features are governed by the plan terms shown at purchase. Taxes, renewals, cancellations, and refunds follow the applicable app store or payment provider rules.',
  },
  {
    title: 'Account Actions',
    body: 'You may deactivate or request deletion from Account Settings. Some records may be retained where required for security, legal, fraud prevention, or payment compliance.',
  },
  {
    title: 'Safety',
    body: 'Do not share sensitive financial information with other members. Report suspicious behaviour and use blocking tools when needed.',
  },
];

export default function TermsConditionsScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(privacyPolicyStyles);

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title="Terms & Conditions"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Terms & Conditions</Text>
          <Text style={styles.updateText}>Last updated: 1st January 2026</Text>
          <Text style={styles.paragraph}>
            These terms describe the rules for using MatchMate. By using the
            app, you agree to follow these terms and our community safety
            standards.
          </Text>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.policySection}>
              <Text style={styles.heading}>{section.title}</Text>
              <Text style={styles.paragraph}>{section.body}</Text>
            </View>
          ))}

          <View style={styles.footer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
