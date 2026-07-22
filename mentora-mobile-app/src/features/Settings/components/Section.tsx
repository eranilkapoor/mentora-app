import React, { memo } from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { settingsStyles } from '../Settings.styles';
import { SectionProps } from '../Settings.types';

export const Section = memo(function Section({
  icon,
  title,
  children,
}: SectionProps): React.ReactElement {
  const styles = useThemedStyles(settingsStyles);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={styles.sectionTitle.color} />
        </View>

        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {children}
    </View>
  );
});
