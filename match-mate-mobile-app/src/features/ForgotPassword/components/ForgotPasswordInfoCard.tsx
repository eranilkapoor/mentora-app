import React from 'react';
import { View, Text } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { forgotPasswordStyles } from '../ForgotPassword.styles';

export function ForgotPasswordInfoCard(): React.ReactElement {
  const styles = useThemedStyles(forgotPasswordStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{t('auth.forgot.what_happens')}</Text>

      {(
        t('auth.forgot.steps', {
          returnObjects: true,
        }) as Array<{
          icon: string;
          text: string;
        }>
      ).map((item) => (
        <View key={item.text} style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Feather name={item.icon} size={14} color={theme.colors.primary} />
          </View>

          <Text style={styles.infoText}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}
