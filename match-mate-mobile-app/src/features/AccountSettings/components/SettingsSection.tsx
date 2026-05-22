import React from 'react';
import { View, Text } from 'react-native';

import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { accountSettingsStyles } from '../styles/accountSettings.styles';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SettingsSection({
  title,
  subtitle,
  children,
}: Props): React.ReactElement {
  const styles = useThemedStyles(accountSettingsStyles);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}
