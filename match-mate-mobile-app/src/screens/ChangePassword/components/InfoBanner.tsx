import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export const InfoBanner = ({ styles }: any) => (
  <View style={styles.infoBanner}>
    <Feather name="shield" size={18} color={Colors.primary} />
    <Text style={styles.infoBannerText}>
      Choose a strong password you don't use elsewhere.
    </Text>
  </View>
);