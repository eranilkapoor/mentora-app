import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export const ThemeHeader = ({ styles, t }: any) => (
  <View style={styles.headerCard}>
    <View style={styles.headerIconWrapper}>
      <Feather name="sun" size={22} color={Colors.primary} />
    </View>
    <Text style={styles.headerTitle}>{t('select_theme')}</Text>
    <Text style={styles.headerSubtitle}>
      {t(
        'theme_subtitle',
        'Choose how Match Mate looks. You can change this anytime.'
      )}
    </Text>
  </View>
);
