import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface ScoreStepperProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function ScoreStepper({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 5,
}: ScoreStepperProps): React.ReactElement {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    scoreLabelBlock: {
      flex: 1,
    },
    scoreLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    scoreSublabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    scoreControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    scoreBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      minWidth: 36,
      textAlign: 'center',
    },
    disabled: {
      opacity: 0.4,
    },
  });


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
        {sublabel ? <Text style={styles.scoreSublabel}>{sublabel}</Text> : null}
      </View>

      <View style={styles.scoreControls}>
        <TouchableOpacity
          style={[styles.scoreBtn, value <= min ? styles.disabled : null]}
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
          style={[styles.scoreBtn, value >= max ? styles.disabled : null]}
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
