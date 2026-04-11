import React from 'react';
import { View, Text } from 'react-native';
import { PASSWORD_RULES } from '../ChangePassword.constants';
import { Colors } from '@/core/constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { changePasswordStyles } from '../ChangePassword.styles';

export function PasswordStrengthBar({
  password,
}: {
  password: string;
}): React.ReactElement | null {
  const styles = useThemedStyles(changePasswordStyles);

  if (password.length === 0) return null;

  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strength =
    passed <= 1
      ? 'Weak'
      : passed <= 2
        ? 'Fair'
        : passed === 3
          ? 'Good'
          : 'Strong';
  const strengthColor =
    passed <= 1
      ? Colors.danger
      : passed <= 2
        ? Colors.accent
        : passed === 3
          ? Colors.link
          : Colors.success;

  return (
    <View style={styles.strengthWrapper}>
      <View style={styles.strengthBarRow}>
        {PASSWORD_RULES.map((rule, i) => (
          <View
            key={rule.label}
            style={[
              styles.strengthSegment,
              i < passed && { backgroundColor: strengthColor },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: strengthColor }]}>
        {strength}
      </Text>

      <View style={styles.rulesContainer}>
        {PASSWORD_RULES.map((rule) => {
          const isPassed = rule.test(password);
          return (
            <View key={rule.label} style={styles.ruleRow}>
              <Feather
                name={isPassed ? 'check-circle' : 'circle'}
                size={13}
                color={isPassed ? Colors.success : Colors.textMuted}
              />
              <Text
                style={[styles.ruleText, isPassed && styles.ruleTextPassed]}
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
