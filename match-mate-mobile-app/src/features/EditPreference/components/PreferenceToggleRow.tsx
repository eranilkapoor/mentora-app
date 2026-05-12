import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface ToggleRowProps {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function PreferenceToggleRow({
  label,
  sublabel,
  value,
  onChange,
}: ToggleRowProps): React.ReactElement {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      minHeight: 44,
    },
    toggleLabelBox: {
      flex: 1,
      marginRight: 12,
    },
    toggleLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      flex: 1,
    },
    toggleSublabel: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLabelBox}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sublabel ? (
          <Text style={styles.toggleSublabel}>{sublabel}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
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
