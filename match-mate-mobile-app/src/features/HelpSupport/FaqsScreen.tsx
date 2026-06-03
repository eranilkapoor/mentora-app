import React, { useCallback, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsNavigationProp } from '@/navigation/types';
import { FAQ_DATA } from './HelpSupport.constants';
import { helpSupportStyles } from './HelpSupport.styles';
import { FaqCard } from './components/FaqCard';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  navigation: SettingsNavigationProp;
};

export default function FaqsScreen({ navigation }: Props): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === index ? null : index));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.support_center.faqs')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
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
