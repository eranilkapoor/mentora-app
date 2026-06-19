import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from '../MatchDetail.styles';

interface Props {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function MatchDetailEmpty({
  isLoading,
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.emptyContainer}>
        {isLoading ? (
          <>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.emptyTitle}>
              {t('match_detail.loading_title')}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.emptyTitle}>
              {title ?? t('match_detail.unavailable_title')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {subtitle ?? t('match_detail.unavailable_subtitle')}
            </Text>
            {actionLabel && onAction ? (
              <TouchableOpacity
                style={styles.emptyAction}
                onPress={onAction}
                activeOpacity={0.84}
                accessibilityRole="button"
              >
                <Text style={styles.emptyActionText}>{actionLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
