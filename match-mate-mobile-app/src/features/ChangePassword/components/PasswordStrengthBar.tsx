import React from 'react';
import { View, Text } from 'react-native';
import { PASSWORD_RULES } from '../ChangePassword.constants';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { changePasswordStyles } from '../ChangePassword.styles';
import { useTheme } from '@/core/theme/ThemeProvider';

export function PasswordStrengthBar({
  password,
}: {
  password: string;
}): React.ReactElement | null {
  const styles = useThemedStyles(changePasswordStyles);
  const { theme } = useTheme();

  if (!password) return null;

  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;

  const strength =
    passed <= 1
      ? 'weak'
      : passed <= 2
        ? 'fair'
        : passed === 3
          ? 'good'
          : 'strong';

  const color =
    passed <= 1
      ? theme.colors.error
      : passed <= 2
        ? theme.colors.warning
        : passed === 3
          ? theme.colors.primary
          : theme.colors.success;

  return (
    <View style={styles.strengthWrapper}>
      <View style={styles.strengthBarRow}>
        {PASSWORD_RULES.map((rule, i) => (
          <View
            key={rule.label}
            style={[
              styles.strengthSegment,
              i < passed ? { backgroundColor: color } : null,
            ]}
          />
        ))}
      </View>

      <Text style={[styles.strengthLabel, { color }]}>
        {strength.toUpperCase()}
      </Text>

      <View style={styles.rulesContainer}>
        {PASSWORD_RULES.map((rule) => {
          const isPassed = rule.test(password);

          return (
            <View key={rule.label} style={styles.ruleRow}>
              <Feather
                name={isPassed ? 'check-circle' : 'circle'}
                size={13}
                color={isPassed ? theme.colors.success : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.ruleText,
                  isPassed ? styles.ruleTextPassed : null,
                ]}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
