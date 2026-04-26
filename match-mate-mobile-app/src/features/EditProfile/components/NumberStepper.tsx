import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { NumberStepperProps } from '../EditProfile.types';

export function NumberStepper({
  label,
  value = 0,
  onChange,
  min = 0,
  max = 20,
}: NumberStepperProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          style={[
            styles.btn,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground },
            value <= min && { opacity: 0.4 },
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
            { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground },
            value >= max && { opacity: 0.4 },
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
});