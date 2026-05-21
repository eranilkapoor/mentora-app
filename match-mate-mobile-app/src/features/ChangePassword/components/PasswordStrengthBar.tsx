import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { PASSWORD_MIN_LENGTH } from '@/core/constants';

const PASSWORD_RULES = [
  {
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (p: string) => p.length >= PASSWORD_MIN_LENGTH,
  },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'One special character',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export function PasswordStrengthBar({
  password,
}: {
  password: string;
}): React.ReactElement | null {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    strengthWrapper: {
      marginTop: 10,
      marginBottom: 4,
    },
    strengthBarRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 6,
    },
    strengthSegment: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },
    rulesContainer: {
      gap: 5,
    },
    ruleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    ruleText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    ruleTextPassed: {
      color: theme.colors.success,
    },
  });

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
