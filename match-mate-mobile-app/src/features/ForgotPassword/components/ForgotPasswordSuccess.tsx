import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { forgotPasswordStyles } from '../ForgotPassword.styles';

interface Props {
  email: string;
  onBack: () => void;
  onResend: () => void;
}

export function ForgotPasswordSuccess({
  email,
  onBack,
  onResend,
}: Props): React.ReactElement {
  const styles = useThemedStyles(forgotPasswordStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.successContainer}>
      <View style={styles.successIconWrapper}>
        <Feather
          name="mail"
          size={36}
          color={theme.colors.primary}
        />
      </View>

      <Text style={styles.successTitle}>
        {t('auth.forgot.success_title')}
      </Text>

      <Text style={styles.successSubtitle}>
        {t('auth.forgot.success_subtitle', { email })}
      </Text>

      <View style={styles.successTips}>
        {(t('auth.forgot.tips', {
          returnObjects: true,
        }) as string[]).map((tip) => (
          <View key={tip} style={styles.tipRow}>
            <Feather
              name="info"
              size={13}
              color={theme.colors.textMuted}
            />

            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onBack}
      >
        <Feather
          name="arrow-left"
          size={16}
          color={theme.colors.white}
        />

        <Text style={styles.primaryButtonText}>
          {t('auth.actions.back_to_sign_in')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendRow}
        onPress={onResend}
      >
        <Feather
          name="refresh-cw"
          size={13}
          color={theme.colors.link}
        />

        <Text style={styles.resendText}>
          {t('auth.actions.resend_reset_link')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}