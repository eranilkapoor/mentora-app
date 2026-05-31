import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface ToggleRowProps {
  /**
   * Main label
   */
  label: string;

  /**
   * Toggle value
   */
  value?: boolean | undefined;

  /**
   * Change handler
   */
  onChange: (value: boolean) => void;

  /**
   * Secondary label
   */
  sublabel?: string | undefined;

  /**
   * Helper text below row
   */
  helperText?: string | undefined;

  /**
   * Error text
   */
  error?: string | undefined;

  /**
   * State
   */
  disabled?: boolean | undefined;
  required?: boolean | undefined;

  /**
   * Tap anywhere on row to toggle
   */
  enableRowPress?: boolean | undefined;

  /**
   * UI size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Optional custom switch colors
   */
  activeTrackColor?: string | undefined;
  inactiveTrackColor?: string | undefined;
  thumbColor?: string | undefined;

  /**
   * Accessibility
   */
  accessibilityLabel?: string | undefined;

  /**
   * Testing
   */
  testID?: string | undefined;

  /**
   * Style overrides
   */
  containerStyle?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;

  labelStyle?: StyleProp<TextStyle>;
  sublabelStyle?: StyleProp<TextStyle>;

  helperTextStyle?: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
}

function ToggleRowComponent({
  label,
  value = false,
  onChange,

  sublabel,
  helperText,
  error,

  disabled = false,
  required = false,

  enableRowPress = true,

  size = 'medium',

  activeTrackColor,
  inactiveTrackColor,
  thumbColor,

  accessibilityLabel,
  testID,

  containerStyle,
  rowStyle,

  labelStyle,
  sublabelStyle,

  helperTextStyle,
  errorTextStyle,
}: ToggleRowProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(() => {
    const isSmall = size === 'small';
    const isLarge = size === 'large';

    return StyleSheet.create({
      container: {
        marginBottom: 16,
        opacity: disabled ? 0.6 : 1,
      },

      row: {
        minHeight: isSmall ? 48 : isLarge ? 60 : 54,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingVertical: isSmall ? 6 : 8,
      },

      content: {
        flex: 1,
        paddingRight: 14,
      },

      contentPressable: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
      },

      label: {
        fontSize: isSmall ? 13 : isLarge ? 16 : 14,
        lineHeight: isSmall ? 18 : isLarge ? 22 : 20,

        fontWeight: '600',
        color: theme.colors.textPrimary,
      },

      required: {
        color: theme.colors.error,
      },

      sublabel: {
        marginTop: 4,

        fontSize: isSmall ? 11 : isLarge ? 13 : 12,

        lineHeight: isSmall ? 16 : isLarge ? 20 : 18,

        color: error ? theme.colors.error : theme.colors.textMuted,
      },

      helperText: {
        marginTop: 6,

        fontSize: 11,
        lineHeight: 16,

        color: theme.colors.textMuted,
      },

      errorText: {
        marginTop: 6,

        fontSize: 11,
        lineHeight: 16,

        color: theme.colors.error,
      },
    });
  }, [disabled, error, size, theme]);

  const handleRowPress = useCallback((): void => {
    if (disabled) {
      return;
    }

    onChange(!value);
  }, [disabled, onChange, value]);

  const handleSwitchChange = useCallback(
    (nextValue: boolean): void => {
      if (disabled) {
        return;
      }

      onChange(nextValue);
    },
    [disabled, onChange]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.row, rowStyle]}>
        <Pressable
          testID={testID}
          disabled={disabled || !enableRowPress}
          onPress={handleRowPress}
          accessibilityRole="switch"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{
            checked: value,
            disabled,
          }}
          style={({ pressed }) => [
            styles.contentPressable,
            pressed && enableRowPress && !disabled
              ? {
                  opacity: 0.85,
                }
              : null,
          ]}
        >
          <View style={styles.content}>
            <Text style={[styles.label, labelStyle]}>
              {label}

              {required ? <Text style={styles.required}> *</Text> : null}
            </Text>

            {sublabel ? (
              <Text style={[styles.sublabel, sublabelStyle]}>{sublabel}</Text>
            ) : null}
          </View>
        </Pressable>

        <Switch
          value={value}
          disabled={disabled}
          onValueChange={handleSwitchChange}
          thumbColor={thumbColor ?? theme.colors.white}
          trackColor={{
            false: inactiveTrackColor ?? theme.colors.switchTrackOff,

            true: activeTrackColor ?? theme.colors.primary,
          }}
          accessibilityRole="switch"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{
            checked: value,
            disabled,
          }}
        />
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={[styles.errorText, errorTextStyle]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, helperTextStyle]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

ToggleRowComponent.displayName = 'ToggleRow';

export const ToggleRow = memo(ToggleRowComponent) as typeof ToggleRowComponent;
