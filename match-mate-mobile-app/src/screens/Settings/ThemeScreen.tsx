import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ThemeMode, setTheme } from '../../store/slices/settingsSlice';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { themeStyles } from './ThemeScreen.styles';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../core/constants/colors';

interface ThemeOption {
  code: ThemeMode;
  label: string;
  description: string;
  icon: string;
}

export default function ThemeScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const styles = useThemedStyles(themeStyles);
  const { t } = useTranslation();
  const currentTheme = useAppSelector((s) => s.settings.theme);

  const themes: ThemeOption[] = [
    {
      code: 'light',
      label: t('light'),
      description: t('light_description', 'Clean white background'),
      icon: 'sun',
    },
    {
      code: 'dark',
      label: t('dark'),
      description: t('dark_description', 'Easy on the eyes at night'),
      icon: 'moon',
    },
    {
      code: 'system',
      label: t('system'),
      description: t('system_description', 'Follows your device settings'),
      icon: 'smartphone',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Card ──────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconWrapper}>
            <Feather name="sun" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('select_theme')}</Text>
          <Text style={styles.headerSubtitle}>
            {t(
              'theme_subtitle',
              'Choose how Match Mate looks. You can change this anytime.',
            )}
          </Text>
        </View>

        {/* ── Info Notice ───────────────────────────────────────────── */}
        <View style={styles.infoCard}>
          <Feather name="info" size={15} color={Colors.primary} />
          <Text style={styles.infoText}>
            {t(
              'theme_info',
              'System theme automatically switches between light and dark based on your device settings.',
            )}
          </Text>
        </View>

        {/* ── Theme Options ─────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Feather name="layers" size={14} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('appearance', 'Appearance')}
            </Text>
          </View>

          {themes.map((item, index) => {
            const isActive = currentTheme === item.code;
            const isLast = index === themes.length - 1;

            return (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.optionRow,
                  isLast && styles.optionRowLast,
                  isActive && styles.optionRowActive,
                ]}
                onPress={() => dispatch(setTheme(item.code))}
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
                accessibilityLabel={item.label}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.optionIconWrapper,
                      isActive && styles.optionIconWrapperActive,
                    ]}
                  >
                    <Feather
                      name={item.icon}
                      size={16}
                      color={isActive ? Colors.primary : Colors.textMuted}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        isActive && styles.optionLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                {isActive ? (
                  <View style={styles.checkBadge}>
                    <Feather name="check" size={13} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.checkBadgeEmpty} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}