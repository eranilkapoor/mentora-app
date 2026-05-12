import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface ToggleRowProps {
  label: string;
  value?: boolean;
  onChange: (v: boolean) => void;
  sublabel?: string;
}

export function ToggleRow({
  label,
  value,
  onChange,
  sublabel,
}: ToggleRowProps): React.ReactElement {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    rowToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      minHeight: 44,
    },
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    sublabel: {
      fontSize: 12,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.rowToggle}>
      <View style={styles.safe}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        {sublabel && (
          <Text style={[styles.sublabel, { color: theme.colors.textMuted }]}>
            {sublabel}
          </Text>
        )}
      </View>
      <Switch
        value={value ?? false}
        onValueChange={onChange}
        trackColor={{
          false: theme.colors.switchTrackOff,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.white}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
  );
}
