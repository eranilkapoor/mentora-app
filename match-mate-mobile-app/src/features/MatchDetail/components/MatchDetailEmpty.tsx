import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from '../MatchDetail.styles';

interface Props {
  isLoading: boolean;
}

export function MatchDetailEmpty({ isLoading }: Props): React.ReactElement {
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
              {t('match_detail.unavailable_title')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('match_detail.unavailable_subtitle')}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
