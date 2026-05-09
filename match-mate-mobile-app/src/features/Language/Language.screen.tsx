import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { languageStyles } from './Language.styles';
import { useLanguageScreen } from './Language.hooks';

import { LanguageHeader } from './components/LanguageHeader';
import { LanguageNotice } from './components/LanguageNotice';
import { LanguageOptionItem } from './components/LanguageOptionItem';
import Header from '@/core/components/Header';
import { LanguageScreenProps } from './Language.types';

export default function LanguageScreen({
  navigation,
}: LanguageScreenProps): React.ReactElement {
  const styles = useThemedStyles(languageStyles);
  const { t, languages, currentLang, onSelectLanguage } = useLanguageScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.language')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LanguageHeader styles={styles} t={t} />

        <LanguageNotice styles={styles} t={t} />

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('language.available_languages')}
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
