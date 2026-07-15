import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';

import { PASSWORD_MIN_LENGTH } from '@/core/constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import {
  getPasswordStrength,
  getPasswordStrengthRules,
  PasswordStrengthLevel,
} from '@/features/Auth/shared/passwordStrength';

type PasswordStrengthHintProps = {
  password: string;
  visible?: boolean;
};

const STRENGTH_SEGMENTS: Record<PasswordStrengthLevel, number> = {
  weak: 1,
  fair: 2,
  strong: 3,
  very_strong: 4,
};

export function PasswordStrengthHint({
  password,
  visible = true,
}: PasswordStrengthHintProps): React.ReactElement | null {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          marginTop: 8,
          marginBottom: 4,
          padding: 12,
          borderRadius: 12,
          backgroundColor: theme.colors.backgroundLight,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8,
        },
        title: {
          color: theme.colors.textSecondary,
          fontSize: 12,
          fontWeight: '600',
        },
        label: {
          fontSize: 12,
          fontWeight: '800',
          textTransform: 'uppercase',
        },
        barRow: {
          flexDirection: 'row',
          gap: 5,
          marginBottom: 10,
        },
        segment: {
          flex: 1,
          height: 5,
          borderRadius: 999,
          backgroundColor: theme.colors.border,
        },
        rules: {
          gap: 6,
        },
        ruleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
        },
        ruleText: {
          color: theme.colors.textMuted,
          fontSize: 12,
          flex: 1,
        },
        passedRuleText: {
          color: theme.colors.success,
          fontWeight: '600',
        },
      }),
    [theme]
  );

  if (!visible) return null;

  const strength = getPasswordStrength(password);
  const rules = getPasswordStrengthRules(password);
  const filledSegments = STRENGTH_SEGMENTS[strength];
  const strengthColor: Record<PasswordStrengthLevel, string> = {
    weak: theme.colors.error,
    fair: theme.colors.warning,
    strong: theme.colors.info,
    very_strong: theme.colors.success,
  };
  const color = strengthColor[strength];

  return (
    <View
      style={styles.wrapper}
      accessibilityLabel={t('auth.password_strength.tooltip_title')}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {t('auth.password_strength.tooltip_title')}
        </Text>
        <Text style={[styles.label, { color }]}>
          {t(`auth.password_strength.${strength}`)}
        </Text>
      </View>

      <View style={styles.barRow}>
        {[1, 2, 3, 4].map((segment) => (
          <View
            key={segment}
            style={[
              styles.segment,
              segment <= filledSegments ? { backgroundColor: color } : null,
            ]}
          />
        ))}
      </View>

      <View style={styles.rules}>
        {rules.map((rule) => (
          <View key={rule.key} style={styles.ruleRow}>
            <Feather
              name={rule.passed ? 'check-circle' : 'circle'}
              size={13}
              color={
                rule.passed ? theme.colors.success : theme.colors.textMuted
              }
            />
            <Text
              style={[
                styles.ruleText,
                rule.passed ? styles.passedRuleText : null,
              ]}
            >
              {t(`auth.password_strength.rules.${rule.key}`, {
                min: PASSWORD_MIN_LENGTH,
              })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
