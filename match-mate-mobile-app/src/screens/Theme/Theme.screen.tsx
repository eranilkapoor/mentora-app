import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { themeStyles } from './Theme.styles';
import { useThemeScreen } from './Theme.hooks';

import { ThemeHeader } from './components/ThemeHeader';
import { ThemeInfo } from './components/ThemeInfo';
import { ThemeOptionItem } from './components/ThemeOptionItem';

export default function ThemeScreen(): React.ReactElement {
  const styles = useThemedStyles(themeStyles);
  const { t, themes, currentTheme, onSelectTheme } = useThemeScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemeHeader styles={styles} t={t} />

        <ThemeInfo styles={styles} t={t} />

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('appearance', 'Appearance')}
            </Text>
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
