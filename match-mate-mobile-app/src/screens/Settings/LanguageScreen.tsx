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
import { Language, setLanguage } from '../../store/slices/settingsSlice';
import i18n from '../../i18n';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { languageStyles } from './LanguageScreen.styles';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../core/constants/colors';

interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  icon: string;
}

export default function LanguageScreen(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const styles = useThemedStyles(languageStyles);
  const currentLang = useAppSelector((s) => s.settings.language);

  const languages: LanguageOption[] = [
    {
      code: 'en',
      label: t('english'),
      nativeName: 'English',
      icon: '🇬🇧',
    },
    {
      code: 'hi',
      label: t('hindi'),
      nativeName: 'हिन्दी',
      icon: '🇮🇳',
    },
  ];

  const handleChange = async (lang: Language): Promise<void> => {
    await i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Card ──────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconWrapper}>
            <Feather name="globe" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('select_language')}</Text>
          <Text style={styles.headerSubtitle}>
            {t(
              'language_subtitle',
              'Choose your preferred language for the app interface.',
            )}
          </Text>
        </View>

        {/* ── Restart Notice ────────────────────────────────────────── */}
        <View style={styles.noticeCard}>
          <Feather name="info" size={15} color={Colors.primary} />
          <Text style={styles.noticeText}>
            {t(
              'language_notice',
              'Some content may require a restart to fully apply the new language.',
            )}
          </Text>
        </View>

        {/* ── Language Options ──────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Feather name="globe" size={14} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>
              {t('available_languages', 'Available Languages')}
            </Text>
          </View>

          {languages.map((item, index) => {
            const isActive = currentLang === item.code;
            const isLast = index === languages.length - 1;

            return (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.optionRow,
                  isLast && styles.optionRowLast,
                  isActive && styles.optionRowActive,
                ]}
                onPress={() => { void handleChange(item.code); }}
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
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
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
                    <Text style={styles.optionNativeName}>
                      {item.nativeName}
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