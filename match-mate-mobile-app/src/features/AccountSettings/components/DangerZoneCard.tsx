import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { accountSettingsStyles } from '../styles/accountSettings.styles';

interface Props {
  title: string;
  description: string;
  buttonText: string;
  destructive?: boolean;
  onPress: () => void;
}

export function DangerZoneCard({
  title,
  description,
  buttonText,
  destructive = false,
  onPress,
}: Props): React.ReactElement {
  const styles = useThemedStyles(accountSettingsStyles);

  return (
    <View style={styles.dangerCard}>
      <View style={styles.dangerContent}>
        <Text style={styles.dangerTitle}>{title}</Text>

        <Text style={styles.dangerDescription}>{description}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.dangerButton, destructive && styles.deleteButton]}
      >
        <Text style={styles.dangerButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}
