import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface CompletionBarProps {
  percent: number;

  title?: string;
  subtitle?: string;

  height?: number;
  showPercentage?: boolean;

  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const CompletionBar = memo(function CompletionBar({
  percent,
  title,
  subtitle,
  height = 8,
  showPercentage = true,
  style,
  testID,
}: CompletionBarProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  /**
   * Clamp value between 0-100
   */
  const safePercent = useMemo<number>(() => {
    if (Number.isNaN(percent)) {
      return 0;
    }

    return Math.min(100, Math.max(0, percent));
  }, [percent]);

  const progressColor = useMemo<string>(() => {
    return safePercent >= 100 ? theme.colors.success : theme.colors.primary;
  }, [safePercent, theme.colors.primary, theme.colors.success]);

  /**
   * Auto subtitle
   */
  const computedSubtitle = useMemo<string>(() => {
    if (subtitle) {
      return subtitle;
    }

    if (safePercent < 50) {
      return t('edit_profile.completion.low');
    }

    if (safePercent < 100) {
      return t('edit_profile.completion.medium');
    }

    return t('edit_profile.completion.complete');
  }, [safePercent, subtitle, t]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,

          ...(Platform.OS === 'ios'
            ? {
                shadowColor: theme.colors.black,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.06,
                shadowRadius: 6,
              }
            : {
                elevation: 2,
              }),
        },

        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
        },

        content: {
          flex: 1,
          paddingRight: 12,
        },

        title: {
          fontSize: 16,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          marginBottom: 4,
        },

        subtitle: {
          fontSize: 13,
          lineHeight: 18,
          color: theme.colors.textMuted,
        },

        percentage: {
          fontSize: 28,
          fontWeight: '800',
        },

        progressTrack: {
          height,
          borderRadius: height / 2,
          backgroundColor: theme.colors.backgroundLight,
          overflow: 'hidden',
        },

        progressFill: {
          height: '100%',
          borderRadius: height / 2,
        },
      }),
    [height, theme]
  );

  return (
    <View
      testID={testID}
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: safePercent,
      }}
      accessibilityLabel={`${safePercent}% completed`}
    >
      <View style={styles.header}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {title ?? t('edit_profile.completion.title')}
          </Text>

          <Text style={styles.subtitle}>{computedSubtitle}</Text>
        </View>

        {showPercentage && (
          <Text
            style={[
              styles.percentage,
              {
                color: progressColor,
              },
            ]}
          >
            {safePercent}%
          </Text>
        )}
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${safePercent}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </View>
  );
});

CompletionBar.displayName = 'CompletionBar';
