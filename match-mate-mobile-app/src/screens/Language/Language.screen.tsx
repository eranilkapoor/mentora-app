import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { languageStyles } from './Language.styles';
import { useLanguageScreen } from './Language.hooks';

import { LanguageHeader } from './components/LanguageHeader';
import { LanguageNotice } from './components/LanguageNotice';
import { LanguageOptionItem } from './components/LanguageOptionItem';

export default function LanguageScreen(): React.ReactElement {
  const styles = useThemedStyles(languageStyles);
  const { t, languages, currentLang, onSelectLanguage } =
    useLanguageScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LanguageHeader styles={styles} t={t} />

        <LanguageNotice styles={styles} t={t} />

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('available_languages', 'Available Languages')}
            </Text>
          </View>

          {languages.map((item, index) => (
            <LanguageOptionItem
              key={item.code}
              item={item}
              isActive={currentLang === item.code}
              isLast={index === languages.length - 1}
              styles={styles}
              onPress={onSelectLanguage}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}