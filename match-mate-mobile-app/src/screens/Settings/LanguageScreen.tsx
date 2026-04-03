import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Language, setLanguage } from '../../store/slices/settingsSlice';
import i18n from '../../i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { languageStyles } from './LanguageScreen.styles';
import { useTranslation } from 'react-i18next';

export default function LanguageScreen() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const styles = useThemedStyles(languageStyles);

  const languages = [
    { code: 'en' as Language, label: t('english') },
    { code: 'hi' as Language, label: t('hindi') },
  ];

  const currentLang = useAppSelector((s) => s.settings.language);

  const changeLanguage = async (lang: Language) => {
    await i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('select_language')}</Text>

          {languages.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.row,
                currentLang === item.code && styles.activeRow,
              ]}
              onPress={() => changeLanguage(item.code)}
            >
              <Text style={styles.label}>{item.label}</Text>
              {currentLang === item.code && <Text>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
