import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

import { NumberStepperProps } from '../EditProfile.types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { editProfileStyles } from '../EditProfile.styles';

export function NumberStepper({
  label,
  value = 0,
  onChange,
  min = 0,
  max = 20,
}: NumberStepperProps): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.rowNumberSteper}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          style={[
            styles.btn,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.inputBackground,
            },
            value <= min ? styles.disabled : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Feather name="minus" size={14} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
          {value}
        </Text>

        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          style={[
            styles.btn,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.inputBackground,
            },
            value >= max ? styles.disabled : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Feather name="plus" size={14} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
