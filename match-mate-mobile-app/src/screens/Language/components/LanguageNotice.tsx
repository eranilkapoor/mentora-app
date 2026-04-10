import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export const LanguageNotice = ({ styles, t }: any) => (
  <View style={styles.noticeCard}>
    <Feather name="info" size={15} color={Colors.primary} />
    <Text style={styles.noticeText}>
      {t(
        'language_notice',
        'Some content may require a restart to fully apply the new language.',
      )}
    </Text>
  </View>
);