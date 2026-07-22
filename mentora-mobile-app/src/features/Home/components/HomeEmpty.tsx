import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from '../Home.styles';

export function HomeEmpty(): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.emptyWrapper}>
      <View style={styles.emptyIconWrapper}>
        <Feather name="heart" size={36} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{t('home.empty_title')}</Text>
      <Text style={styles.emptySub}>{t('home.empty_subtitle')}</Text>
    </View>
  );
}
