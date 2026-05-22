import React from 'react';

import { View, Text } from 'react-native';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { privacySettingsStyles } from '../PrivacySettings.styles';

interface PrivacySectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PrivacySection({
  title,
  subtitle,
  children,
}: PrivacySectionProps): React.ReactElement {
  const styles = useThemedStyles(privacySettingsStyles);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {children}
    </View>
  );
}
