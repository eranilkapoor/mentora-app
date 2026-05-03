import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { WeightSliderProps } from '../EditPreference.types';
import { editPreferenceStyles } from '../EditPreference.styles';
import { WEIGHT_MAX, WEIGHT_MIN } from '../EditPreference.constants';

export function WeightSlider({
  label,
  value,
  onChange,
}: WeightSliderProps): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { theme } = useTheme();

  const decrease = useCallback(
    () => onChange(Math.max(WEIGHT_MIN, value - 1)),
    [value, onChange]
  );

  const increase = useCallback(
    () => onChange(Math.min(WEIGHT_MAX, value + 1)),
    [value, onChange]
  );

  const fillPercent = ((value - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100;

  return (
    <View>
      <View style={styles.weightRow}>
        <Text style={styles.weightLabel}>{label}</Text>
        <View style={styles.weightBtnRow}>
          <TouchableOpacity
            style={[styles.weightBtn, value <= WEIGHT_MIN && { opacity: 0.4 }]}
            onPress={decrease}
            disabled={value <= WEIGHT_MIN}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${label} weight`}
          >
            <Feather name="minus" size={12} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.weightValue}>{value}</Text>

          <TouchableOpacity
            style={[styles.weightBtn, value >= WEIGHT_MAX && { opacity: 0.4 }]}
            onPress={increase}
            disabled={value >= WEIGHT_MAX}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${label} weight`}
          >
            <Feather name="plus" size={12} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Visual fill bar */}
      <View style={styles.weightTrack}>
        <View style={[styles.weightFill, { width: `${fillPercent}%` }]} />
      </View>
    </View>
  );
}
