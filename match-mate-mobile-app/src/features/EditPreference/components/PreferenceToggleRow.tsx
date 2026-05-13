import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Pressable,
} from 'react-native';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface PreferenceToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;

  sublabel?: string;
  helperText?: string;
  error?: string;

  disabled?: boolean;
  required?: boolean;

  size?: 'small' | 'medium' | 'large';

  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  sublabelStyle?: StyleProp<TextStyle>;

  accessibilityLabel?: string;
  testID?: string;

  /**
   * Allows toggling by tapping entire row
   * default: true
   */
  enableRowPress?: boolean;

  /**
   * Optional custom colors
   */
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  thumbColor?: string;
}

function PreferenceToggleRowComponent({
  label,
  value,
  onChange,

  sublabel,
  helperText,
  error,

  disabled = false,
  required = false,

  size = 'medium',

  containerStyle,
  labelStyle,
  sublabelStyle,

  accessibilityLabel,
  testID,

  enableRowPress = true,

  activeTrackColor,
  inactiveTrackColor,
  thumbColor,
}: PreferenceToggleRowProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
          opacity: disabled ? 0.6 : 1,
        },

        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 52,
        },

        content: {
          flex: 1,
          paddingRight: 14,
        },

        label: {
          fontSize: size === 'small' ? 12 : size === 'large' ? 15 : 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
        },

        sublabel: {
          marginTop: 4,
          fontSize: size === 'small' ? 10 : size === 'large' ? 13 : 11,
          lineHeight: size === 'small' ? 14 : size === 'large' ? 18 : 16,
          color: error ? theme.colors.error : theme.colors.textMuted,
        },

        helperText: {
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.textMuted,
        },

        errorText: {
          marginTop: 6,
          fontSize: 11,
          color: theme.colors.error,
        },
      }),
    [disabled, error, size, theme]
  );

  const handleToggle = (): void => {
    if (disabled) {
      return;
    }

    onChange(!value);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        testID={testID}
        disabled={!enableRowPress || disabled}
        onPress={handleToggle}
        accessibilityRole="switch"
        accessibilityState={{
          checked: value,
          disabled,
        }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={styles.row}
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

        <Switch
          value={value}
          disabled={disabled}
          onValueChange={onChange}
          thumbColor={thumbColor ?? theme.colors.white}
          trackColor={{
            false: inactiveTrackColor ?? theme.colors.switchTrackOff,
            true: activeTrackColor ?? theme.colors.primary,
          }}
          accessibilityRole="switch"
          accessibilityLabel={accessibilityLabel ?? label}
        />
      </Pressable>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

PreferenceToggleRowComponent.displayName = 'PreferenceToggleRow';

export const PreferenceToggleRow = memo(
  PreferenceToggleRowComponent
) as typeof PreferenceToggleRowComponent;
