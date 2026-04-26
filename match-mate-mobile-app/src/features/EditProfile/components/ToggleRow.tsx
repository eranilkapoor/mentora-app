import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ToggleRowProps } from '../EditProfile.types';

export function ToggleRow({
  label,
  value,
  onChange,
  sublabel,
}: ToggleRowProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    minHeight: 44,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 12,
    marginTop: 2,
  },
});