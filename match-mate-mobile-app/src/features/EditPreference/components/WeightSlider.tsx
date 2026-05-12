import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { WEIGHT_MAX, WEIGHT_MIN } from '../EditPreference.constants';

export interface WeightSliderProps {
  label: string;
  value?: number;
  onChange: (v: number) => void;
}

interface Styles {
  container: ViewStyle;
  weightRow: ViewStyle;
  weightLabel: TextStyle;
  weightValue: TextStyle;
  weightTrack: ViewStyle;
  weightFill: ViewStyle;
  weightBtnRow: ViewStyle;
  weightBtn: ViewStyle;
  disabled: ViewStyle;
}

export function WeightSlider({
  label,
  value = WEIGHT_MIN,
  onChange,
}: WeightSliderProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create<Styles>({
        container: {
          marginBottom: 16,
        },

        weightRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },

        weightLabel: {
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        weightValue: {
          minWidth: 32,
          fontSize: 13,
          fontWeight: '700',
          color: theme.colors.primary,
          textAlign: 'right',
        },

        weightTrack: {
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.colors.backgroundLight,
          overflow: 'hidden',
        },

        weightFill: {
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.colors.primary,
        },

        weightBtnRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },

        weightBtn: {
          width: 28,
          height: 28,
          borderRadius: 7,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.inputBackground,
          alignItems: 'center',
          justifyContent: 'center',
        },

        disabled: {
          opacity: 0.4,
        },
      }),
    [theme]
  );

  const decrease = useCallback((): void => {
    onChange(Math.max(WEIGHT_MIN, value - 1));
  }, [onChange, value]);

  const increase = useCallback((): void => {
    onChange(Math.min(WEIGHT_MAX, value + 1));
  }, [onChange, value]);

  const fillPercent = useMemo<number>(() => {
    return (
      ((value - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100
    );
  }, [value]);

  return (
    <View style={styles.container}>
      <View style={styles.weightRow}>
        <Text style={styles.weightLabel}>{label}</Text>

        <View style={styles.weightBtnRow}>
          <TouchableOpacity
            style={[
              styles.weightBtn,
              value <= WEIGHT_MIN ? styles.disabled : null,
            ]}
            onPress={decrease}
            disabled={value <= WEIGHT_MIN}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${label} weight`}
          >
            <Feather
              name="minus"
              size={12}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={styles.weightValue}>{value}</Text>

          <TouchableOpacity
            style={[
              styles.weightBtn,
              value >= WEIGHT_MAX ? styles.disabled : null,
            ]}
            onPress={increase}
            disabled={value >= WEIGHT_MAX}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${label} weight`}
          >
            <Feather
              name="plus"
              size={12}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weightTrack}>
        <View
          style={[
            styles.weightFill,
            {
              width: `${fillPercent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}