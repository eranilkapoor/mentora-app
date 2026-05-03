import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { editProfileStyles } from '../EditProfile.styles';

interface Props {
  percent: number;
}

export function CompletionBar({ percent }: Props): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

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
        <View style={{ flex: 1 }}>
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
