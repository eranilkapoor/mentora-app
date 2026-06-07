import React, { memo, useCallback, useMemo, useRef, useState } from 'react';

import {
  GestureResponderEvent,
  PanResponder,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface RangeValue {
  min: number;
  max: number;
}

export interface NullableRangeValue {
  min?: number | null;
  max?: number | null;
}

export interface RangeInputProps {
  label: string;
  value?: NullableRangeValue | null;
  onChange: (value: NullableRangeValue) => void;
  minLimit: number;
  maxLimit: number;
  step?: number;
  unit?: string;
  defaultMinValue?: number;
  defaultMaxValue?: number;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  minLabel?: string;
  maxLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

type HandleSide = 'min' | 'max';

const HANDLE_SIZE = 30;

function RangeInputComponent({
  label,
  value,
  onChange,
  minLimit,
  maxLimit,
  step = 1,
  unit,
  defaultMinValue,
  defaultMaxValue,
  disabled = false,
  required = false,
  error,
  helperText,
  minLabel,
  maxLabel,
  containerStyle,
  labelStyle,
  inputStyle,
  accessibilityLabel,
  testID,
}: RangeInputProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackXRef = useRef(0);

  const safeStep = Math.max(1, step);
  const rangeSpan = Math.max(maxLimit - minLimit, safeStep);

  const clampValue = useCallback(
    (nextValue: number): number =>
      Math.min(Math.max(nextValue, minLimit), maxLimit),
    [maxLimit, minLimit]
  );

  const snapValue = useCallback(
    (nextValue: number): number => {
      const stepped = Math.round(nextValue / safeStep) * safeStep;
      return clampValue(stepped);
    },
    [clampValue, safeStep]
  );

  const normalizeBound = useCallback(
    (bound: number | null | undefined): number | null => {
      if (typeof bound !== 'number' || !Number.isFinite(bound)) {
        return null;
      }

      return clampValue(bound);
    },
    [clampValue]
  );

  const resolvedMin =
    normalizeBound(value?.min) ?? normalizeBound(defaultMinValue) ?? minLimit;
  const resolvedMax =
    normalizeBound(value?.max) ?? normalizeBound(defaultMaxValue) ?? maxLimit;
  const displayMin = Math.min(resolvedMin, resolvedMax);
  const displayMax = Math.max(resolvedMin, resolvedMax);

  const percentForValue = useCallback(
    (nextValue: number): number =>
      ((nextValue - minLimit) / Math.max(maxLimit - minLimit, 1)) * 100,
    [maxLimit, minLimit]
  );

  const valueFromLocation = useCallback(
    (locationX: number): number => {
      if (trackWidth <= 0) {
        return minLimit;
      }

      const safeX = Math.min(Math.max(locationX, 0), trackWidth);
      const percent = safeX / trackWidth;

      return snapValue(minLimit + rangeSpan * percent);
    },
    [minLimit, rangeSpan, snapValue, trackWidth]
  );

  const minPercent = percentForValue(displayMin);
  const maxPercent = percentForValue(displayMax);

  const measureTrack = useCallback((): void => {
    trackRef.current?.measureInWindow((x) => {
      trackXRef.current = x;
    });
  }, []);

  const updateHandle = useCallback(
    (side: HandleSide, nextValue: number): void => {
      if (disabled) {
        return;
      }

      if (side === 'min') {
        onChange({
          min: Math.min(nextValue, displayMax),
          max: displayMax,
        });
        return;
      }

      onChange({
        min: displayMin,
        max: Math.max(nextValue, displayMin),
      });
    },
    [disabled, displayMax, displayMin, onChange]
  );

  const updateHandleFromPageX = useCallback(
    (side: HandleSide, pageX: number): void => {
      updateHandle(side, valueFromLocation(pageX - trackXRef.current));
    },
    [updateHandle, valueFromLocation]
  );

  const createHandleResponder = useCallback(
    (side: HandleSide) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          measureTrack();
          updateHandleFromPageX(side, event.nativeEvent.pageX);
        },
        onPanResponderMove: (event) => {
          updateHandleFromPageX(side, event.nativeEvent.pageX);
        },
      }),
    [disabled, measureTrack, updateHandleFromPageX]
  );

  const minResponder = useMemo(
    () => createHandleResponder('min'),
    [createHandleResponder]
  );
  const maxResponder = useMemo(
    () => createHandleResponder('max'),
    [createHandleResponder]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1,
        },
        labelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        },
        label: {
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },
        required: {
          color: theme.colors.error,
        },
        helper: {
          marginTop: 4,
          fontSize: 11,
          color: theme.colors.textMuted,
        },
        valueRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          gap: 12,
        },
        valuePill: {
          flex: 1,
          minHeight: 42,
          justifyContent: 'center',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? theme.colors.error : theme.colors.border,
          backgroundColor: theme.colors.inputBackground,
          paddingHorizontal: 12,
        },
        valueLabel: {
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          color: theme.colors.textMuted,
        },
        valueText: {
          marginTop: 2,
          fontSize: 13,
          fontWeight: '800',
          color: theme.colors.textPrimary,
        },
        trackWrap: {
          marginTop: 20,
          paddingVertical: 22,
        },
        track: {
          height: 10,
          borderRadius: 999,
          backgroundColor: theme.colors.backgroundLight,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          overflow: 'visible',
        },
        fill: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          borderRadius: 999,
          backgroundColor: theme.colors.primary,
        },
        thumb: {
          position: 'absolute',
          top: -(HANDLE_SIZE - 10) / 2,
          width: HANDLE_SIZE,
          height: HANDLE_SIZE,
          borderRadius: HANDLE_SIZE / 2,
          borderWidth: 3,
          borderColor: theme.colors.surface,
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.black,
          shadowOpacity: 0.16,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        },
        thumbMax: {
          backgroundColor: theme.colors.accent,
        },
        thumbTouchArea: {
          position: 'absolute',
          top: -18,
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
        },
        limitRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 4,
        },
        limitText: {
          fontSize: 11,
          fontWeight: '700',
          color: theme.colors.textMuted,
        },
        resetButton: {
          alignSelf: 'flex-start',
          minHeight: 32,
          justifyContent: 'center',
          marginTop: 10,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        resetText: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.colors.textSecondary,
        },
        errorText: {
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.error,
        },
      }),
    [disabled, error, theme]
  );

  const formatValue = useCallback(
    (option: number): string => {
      if (unit === '₹' || unit === 'â‚¹' || unit === 'Ã¢â€šÂ¹') {
        if (option >= 10000000) {
          return `₹ ${option / 10000000}Cr`;
        }

        if (option >= 100000) {
          return `₹ ${option / 100000}L`;
        }

        if (option >= 1000) {
          return `₹ ${option / 1000}K`;
        }

        return `₹ ${option}`;
      }

      return unit ? `${option} ${unit}` : String(option);
    },
    [unit]
  );

  const handleTrackPress = useCallback(
    (event: GestureResponderEvent): void => {
      if (disabled || trackWidth <= 0) {
        return;
      }

      const nextValue = valueFromLocation(event.nativeEvent.locationX);
      const minDistance = Math.abs(nextValue - displayMin);
      const maxDistance = Math.abs(nextValue - displayMax);

      updateHandle(minDistance <= maxDistance ? 'min' : 'max', nextValue);
    },
    [
      disabled,
      displayMax,
      displayMin,
      trackWidth,
      updateHandle,
      valueFromLocation,
    ]
  );

  const handleReset = useCallback((): void => {
    onChange({
      min: normalizeBound(defaultMinValue) ?? minLimit,
      max: normalizeBound(defaultMaxValue) ?? maxLimit,
    });
  }, [
    defaultMaxValue,
    defaultMinValue,
    maxLimit,
    minLimit,
    normalizeBound,
    onChange,
  ]);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      </View>

      {helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : unit ? (
        <Text style={styles.helper}>
          {t('preference.range.drag_hint', { unit })}
        </Text>
      ) : null}

      <View style={styles.valueRow}>
        <View style={[styles.valuePill, inputStyle]}>
          <Text style={styles.valueLabel}>
            {minLabel ?? t('preference.range.min')}
          </Text>
          <Text style={styles.valueText}>{formatValue(displayMin)}</Text>
        </View>

        <View style={[styles.valuePill, inputStyle]}>
          <Text style={styles.valueLabel}>
            {maxLabel ?? t('preference.range.max')}
          </Text>
          <Text style={styles.valueText}>{formatValue(displayMax)}</Text>
        </View>
      </View>

      <Pressable
        disabled={disabled}
        onPress={handleTrackPress}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel ?? label}
        style={styles.trackWrap}
      >
        <View
          ref={trackRef}
          style={styles.track}
          onLayout={(event) => {
            setTrackWidth(event.nativeEvent.layout.width);
            measureTrack();
          }}
        >
          <View
            style={[
              styles.fill,
              {
                left: `${minPercent}%`,
                right: `${100 - maxPercent}%`,
              },
            ]}
          />

          <View
            style={[
              styles.thumbTouchArea,
              {
                left: `${minPercent}%`,
                transform: [{ translateX: -24 }],
              },
            ]}
            {...minResponder.panHandlers}
          >
            <View pointerEvents="none" style={styles.thumb} />
          </View>

          <View
            style={[
              styles.thumbTouchArea,
              {
                left: `${maxPercent}%`,
                transform: [{ translateX: -24 }],
              },
            ]}
            {...maxResponder.panHandlers}
          >
            <View
              pointerEvents="none"
              style={[styles.thumb, styles.thumbMax]}
            />
          </View>
        </View>

        <View style={styles.limitRow}>
          <Text style={styles.limitText}>{formatValue(minLimit)}</Text>
          <Text style={styles.limitText}>{formatValue(maxLimit)}</Text>
        </View>
      </Pressable>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={handleReset}
        accessibilityRole="button"
        accessibilityLabel={t('preference.range.reset')}
        style={styles.resetButton}
      >
        <Text style={styles.resetText}>{t('preference.range.reset')}</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

RangeInputComponent.displayName = 'RangeInput';

export const RangeInput = memo(
  RangeInputComponent
) as typeof RangeInputComponent;
