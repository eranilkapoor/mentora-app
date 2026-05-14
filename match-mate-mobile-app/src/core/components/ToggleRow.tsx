import React, { useMemo } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface ToggleRowProps {
  label: string;
  value?: boolean;
  onChange: (value: boolean) => void;

  sublabel?: string;

  disabled?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  sublabelStyle?: StyleProp<TextStyle>;

  testID?: string;
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  label: TextStyle;
  sublabel: TextStyle;
}

export function ToggleRow({
  label,
  value = false,
  onChange,

  sublabel,

  disabled = false,

  containerStyle,
  labelStyle,
  sublabelStyle,

  testID,
}: ToggleRowProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create<Styles>({
        container: {
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        },

        content: {
          flex: 1,
          paddingRight: 12,
        },

        label: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        sublabel: {
          marginTop: 4,
          fontSize: 12,
          lineHeight: 16,
          color: theme.colors.textMuted,
        },
      }),
    [theme]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>

        {sublabel ? (
          <Text style={[styles.sublabel, sublabelStyle]}>{sublabel}</Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.switchTrackOff,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.white}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{
          checked: value,
          disabled,
        }}
        testID={testID}
      />
    </View>
  );
}

ToggleRow.displayName = 'ToggleRow';
