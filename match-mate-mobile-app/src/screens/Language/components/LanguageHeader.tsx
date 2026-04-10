import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export const LanguageHeader = ({ styles, t }: any) => (
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
);