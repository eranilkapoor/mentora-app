import React from 'react';

import {
  View,
  Text,
  Pressable,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { communicationSettingsStyles } from '../CommunicationSettings.styles';

interface Props {
  label: string;

  description?: string;

  value: string;

  onPress: () => void;

  isLast?: boolean;
}

export function CommunicationSelectRow({
  label,
  description,
  value,
  onPress,
  isLast = false,
}: Props): React.ReactElement {
  const styles = useThemedStyles(
    communicationSettingsStyles
  );

  const { theme } = useTheme();

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.selectRow,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.selectLeft}>
          <Text style={styles.selectLabel}>
            {label}
          </Text>

          {description ? (
            <Text style={styles.selectDescription}>
              {description}
            </Text>
          ) : null}
        </View>

        <View style={styles.selectRight}>
          <Text style={styles.selectValue}>
            {value.replaceAll('_', ' ')}
          </Text>

          <Feather
            name="chevron-right"
            size={18}
            color={theme.colors.textMuted}
          />
        </View>
      </Pressable>

      {!isLast ? (
        <View style={styles.rowDivider} />
      ) : null}
    </>
  );
}