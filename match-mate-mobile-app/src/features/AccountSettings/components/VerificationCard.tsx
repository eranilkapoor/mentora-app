import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { accountSettingsStyles } from '../styles/accountSettings.styles';

interface Props {
  icon: string;
  title: string;
  description: string;
  verified: boolean;
  onPress?: () => void;
}

export function VerificationCard({
  icon,
  title,
  description,
  verified,
  onPress,
}: Props): React.ReactElement {
  const styles = useThemedStyles(accountSettingsStyles);

  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.infoCard}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.infoLeft}>
        <View style={styles.iconWrapper}>
          <Feather name={icon} size={18} color={theme.colors.primary} />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>{title}</Text>

          <Text style={styles.infoDescription}>{description}</Text>
        </View>
      </View>

      <View
        style={[
          styles.badge,
          verified ? styles.badgeSuccess : styles.badgeWarning,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            verified ? styles.badgeTextSuccess : styles.badgeTextWarning,
          ]}
        >
          {verified ? 'Verified' : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
