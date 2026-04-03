import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ThemeMode, setTheme } from '../../store/slices/settingsSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeStyles } from './ThemeScreen.styles';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

export default function ThemeScreen() {
  const dispatch = useAppDispatch();
  const styles = useThemedStyles(themeStyles);
  const { t } = useTranslation();

  const themes = [
    { code: 'light' as ThemeMode, label: t('light') },
    { code: 'dark' as ThemeMode, label: t('dark') },
    { code: 'system' as ThemeMode, label: t('system') },
  ];

  const currentTheme = useAppSelector((s) => s.settings.theme);

  const changeTheme = async (theme: ThemeMode) => {
    dispatch(setTheme(theme));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('select_theme')}</Text>

          {themes.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.row,
                currentTheme === item.code && styles.activeRow,
              ]}
              onPress={() => changeTheme(item.code)}
            >
              <Text style={styles.label}>{item.label}</Text>
              {currentTheme === item.code && <Text>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
