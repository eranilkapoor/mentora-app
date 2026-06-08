import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from '../Profile.styles';

interface Props {
  items: Array<string | { label: string; icon?: string }>;
}

export function TagList({ items }: Props): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (items.length === 0) {
    return <Text style={styles.tagEmptyText}>{t('common.empty_value')}</Text>;
  }

  return (
    <View style={styles.tagList}>
      {items.map((item, index) => (
        <View
          key={`${typeof item === 'string' ? item : item.label}-${index}`}
          style={styles.tag}
        >
          <Feather
            name={typeof item === 'string' ? 'check' : (item.icon ?? 'heart')}
            size={12}
            color={theme.colors.primary}
          />
          <Text style={styles.tagText}>
            {typeof item === 'string' ? item : item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
