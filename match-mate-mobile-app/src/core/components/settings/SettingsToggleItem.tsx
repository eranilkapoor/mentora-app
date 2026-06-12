import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ToggleRow } from '@/core/components/ToggleRow';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

interface Props {
  icon?: React.ComponentProps<typeof Feather>['name'];
  label: string;
  sublabel?: string;
  value: boolean;
  disabled?: boolean;
  isLast?: boolean;
  onChange: (value: boolean) => void;
}

const createStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    row: {
      ...StyleSheet.flatten(base.row),
      paddingLeft: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    iconWrapper: {
      ...StyleSheet.flatten(base.iconTile),
      marginRight: 10,
    },
    iconWrapperDisabled: {
      backgroundColor: theme.colors.backgroundLight,
    },
    toggleWrapper: { flex: 1 },
    toggleContainer: { marginBottom: 0 },
    toggleRow: { paddingRight: 14 },
  });

export function SettingsToggleItem({
  icon,
  label,
  sublabel,
  value,
  disabled = false,
  isLast = false,
  onChange,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      {icon ? (
        <View
          style={[styles.iconWrapper, disabled && styles.iconWrapperDisabled]}
        >
          <Feather
            name={icon}
            size={16}
            color={disabled ? theme.colors.textMuted : theme.colors.primary}
          />
        </View>
      ) : null}
      <View style={styles.toggleWrapper}>
        <ToggleRow
          label={label}
          sublabel={sublabel ?? ''}
          value={value}
          onChange={onChange}
          disabled={disabled}
          enableRowPress
          size="medium"
          containerStyle={styles.toggleContainer}
          rowStyle={styles.toggleRow}
        />
      </View>
    </View>
  );
}
