import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from '../Profile.styles';
import { SectionProps } from '../Profile.types';

export function Section({
  titleKey,
  icon,
  children,
}: SectionProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather
            name={icon as never}
            size={14}
            color={theme.colors.primary}
          />
        </View>
        <Text style={styles.sectionTitle}>{t(titleKey)}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}
