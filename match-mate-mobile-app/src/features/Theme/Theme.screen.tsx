import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { themeStyles } from './Theme.styles';
import { useThemeScreen } from './Theme.hooks';

import { ThemeHeader } from './components/ThemeHeader';
import { ThemeInfo } from './components/ThemeInfo';
import { ThemeOptionItem } from './components/ThemeOptionItem';
import Header from '@/core/components/Header';
import { ThemeScreenProps } from './Theme.types';

export default function ThemeScreen({
  navigation,
}: ThemeScreenProps): React.ReactElement {
  const styles = useThemedStyles(themeStyles);
  const { t, themes, currentTheme, onSelectTheme } = useThemeScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.theme')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemeHeader styles={styles} t={t} />

        <ThemeInfo styles={styles} t={t} />

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('theme.appearance')}</Text>
          </View>

          {themes.map((item, index) => (
            <ThemeOptionItem
              key={item.code}
              item={item}
              isActive={currentTheme === item.code}
              isLast={index === themes.length - 1}
              styles={styles}
              onPress={onSelectTheme}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
