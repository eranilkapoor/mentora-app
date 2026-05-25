import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/core/components/Header';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsNavigationProp } from '@/navigation/types';
import { communityGuidelinesStyles } from './CommunityGuidelines.styles';

type Props = {
  navigation: SettingsNavigationProp;
};

const GUIDELINES = [
  {
    title: 'Use truthful profile details',
    body: 'Use your real identity, current photos, accurate relationship status, and honest family, education, and profession details.',
  },
  {
    title: 'Communicate respectfully',
    body: 'Do not harass, threaten, pressure, shame, or send abusive messages. Matrimonial conversations should remain consent-based and family-safe.',
  },
  {
    title: 'Protect privacy',
    body: 'Do not share another member phone number, email, photos, address, documents, or chat screenshots without permission.',
  },
  {
    title: 'Avoid fraud and solicitation',
    body: 'Do not request money, promote outside services, impersonate anyone, or use MatchMate for commercial lead generation.',
  },
  {
    title: 'Report unsafe behavior',
    body: 'Use report and block actions when a profile looks fake, suspicious, abusive, or violates privacy expectations.',
  },
];

export default function CommunityGuidelinesScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(communityGuidelinesStyles);

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title="Community Guidelines"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsCard
          icon="shield"
          title="Community Guidelines"
          subtitle="Keep matrimonial discovery safe, honest, and respectful"
        >
          {GUIDELINES.map((item, index) => (
            <View
              key={item.title}
              style={[
                styles.guidelineRow,
                index === GUIDELINES.length - 1 && styles.guidelineRowLast,
              ]}
            >
              <Text style={styles.guidelineNumber}>{index + 1}</Text>
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineTitle}>{item.title}</Text>
                <Text style={styles.guidelineBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
