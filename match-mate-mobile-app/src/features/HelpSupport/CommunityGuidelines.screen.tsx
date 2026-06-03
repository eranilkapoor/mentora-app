import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsNavigationProp } from '@/navigation/types';
import { communityGuidelinesStyles } from './CommunityGuidelines.styles';

type Props = {
  navigation: SettingsNavigationProp;
};

const GUIDELINE_KEYS = ['truthful', 'respect', 'privacy', 'fraud', 'report'];

export default function CommunityGuidelinesScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(communityGuidelinesStyles);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.support_center.community_guidelines')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsCard
          icon="shield"
          title={t('settings.support_center.community_guidelines')}
          subtitle={t('community_guidelines.subtitle')}
        >
          {GUIDELINE_KEYS.map((key, index) => (
            <View
              key={key}
              style={[
                styles.guidelineRow,
                index === GUIDELINE_KEYS.length - 1 && styles.guidelineRowLast,
              ]}
            >
              <Text style={styles.guidelineNumber}>{index + 1}</Text>
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineTitle}>
                  {t(`community_guidelines.items.${key}.title`)}
                </Text>
                <Text style={styles.guidelineBody}>
                  {t(`community_guidelines.items.${key}.body`)}
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
