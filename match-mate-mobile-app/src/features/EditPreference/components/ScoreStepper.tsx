import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ScoreStepperProps } from '../EditPreference.types';
import { editPreferenceStyles } from '../EditPreference.styles';

export function ScoreStepper({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 5,
}: ScoreStepperProps): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { theme } = useTheme();

  const decrease = useCallback(
    () => onChange(Math.max(min, value - step)),
    [value, min, step, onChange]
  );

  const increase = useCallback(
    () => onChange(Math.min(max, value + step)),
    [value, max, step, onChange]
  );

  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLabelBlock}>
        <Text style={styles.scoreLabel}>{label}</Text>
        {sublabel ? (
          <Text style={styles.scoreSublabel}>{sublabel}</Text>
        ) : null}
      </View>

      <View style={styles.scoreControls}>
        <TouchableOpacity
          style={[styles.scoreBtn, value <= min && { opacity: 0.4 }]}
          onPress={decrease}
          disabled={value <= min}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Feather name="minus" size={14} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>
          {value}%
        </Text>

        <TouchableOpacity
          style={[styles.scoreBtn, value >= max && { opacity: 0.4 }]}
          onPress={increase}
          disabled={value >= max}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Feather name="plus" size={14} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}