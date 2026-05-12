import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

interface InfoBannerProps {
  infoText: string;
}

export function InfoBanner({
  infoText,
}: InfoBannerProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        infoBanner: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 10,
          padding: 14,
          marginBottom: 20,
        },
        iconWrapper: {
          marginRight: 10,
        },
        infoBannerText: {
          flex: 1,
          fontSize: 13,
          color: theme.colors.primary,
          fontWeight: '500',
          lineHeight: 18,
        },
      }),
    [theme]
  );

  return (
    <View style={styles.infoBanner}>
      <View style={styles.iconWrapper}>
        <Feather name="shield" size={18} color={theme.colors.primary} />
      </View>

      <Text style={styles.infoBannerText}>{infoText}</Text>
    </View>
  );
}

InfoBanner.displayName = 'InfoBanner';