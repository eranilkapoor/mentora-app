import React from 'react';

import { View, Text } from 'react-native';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { communicationSettingsStyles } from '../CommunicationSettings.styles';

interface Props {
  title: string;

  subtitle?: string;

  children: React.ReactNode;
}

export function CommunicationSection({
  title,
  subtitle,
  children,
}: Props): React.ReactElement {
  const styles = useThemedStyles(
    communicationSettingsStyles
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {children}
    </View>
  );
}