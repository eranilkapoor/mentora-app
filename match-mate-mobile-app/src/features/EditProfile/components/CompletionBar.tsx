import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';

interface Props {
  percent: number;
}

export function CompletionBar({ percent }: Props): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = StyleSheet.create({
    // ── Completion ────────────────────────────────────────────────────────────
    flex: {
      flex: 1,
    },
    completionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...(Platform.OS === 'ios' || Platform.OS === 'android'
        ? {
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)',
        }
        : {
          shadowColor: theme.colors.black,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }),
    },
    completionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    completionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    completionSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      maxWidth: 220,
    },
    completionPercent: {
      fontSize: 24,
      fontWeight: '900',
    },
    progressBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.backgroundLight,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 6,
      borderRadius: 3,
    },
  });

  const color =
    percent < 40
      ? theme.colors.danger
      : percent < 75
        ? theme.colors.accent
        : theme.colors.success;

  const subtitleKey =
    percent < 50
      ? 'edit_profile.completion.low'
      : percent < 100
        ? 'edit_profile.completion.medium'
        : 'edit_profile.completion.complete';

  return (
    <View style={styles.completionCard}>
      <View style={styles.completionRow}>
        <View style={styles.flex}>
          <Text style={styles.completionTitle}>
            {t('edit_profile.completion.title')}
          </Text>
          <Text style={styles.completionSubtitle}>{t(subtitleKey)}</Text>
        </View>
        <Text style={[styles.completionPercent, { color }]}>{percent}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}
