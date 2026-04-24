import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from '../Notifications.styles';

export function EmptyState(): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrapper}>
        <Feather name="bell-off" size={32} color={theme.colors.textMuted} />
      </View>

      <Text style={styles.emptyTitle}>{t('notifications.empty_title')}</Text>

      <Text style={styles.emptySubtitle}>
        {t('notifications.empty_subtitle')}
      </Text>
    </View>
  );
}
