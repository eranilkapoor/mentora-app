import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export const ThemeInfo = ({ styles, t }: any) => (
  <View style={styles.infoCard}>
    <Feather name="info" size={15} color={Colors.primary} />
    <Text style={styles.infoText}>
      {t(
        'theme_info',
        'System theme automatically switches between light and dark based on your device settings.'
      )}
    </Text>
  </View>
);
