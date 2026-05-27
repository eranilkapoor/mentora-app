import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';

interface Props {
  hasQuery: boolean;
}

export function MatchEmpty({ hasQuery }: Props): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Feather name="search" size={36} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>
        {hasQuery ? t('matches.empty_search_title') : t('matches.empty_title')}
      </Text>
      <Text style={styles.emptySubtitle}>
        {hasQuery
          ? t('matches.empty_search_subtitle')
          : t('matches.empty_subtitle')}
      </Text>
    </View>
  );
}
