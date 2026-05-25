import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ToggleRow } from '@/core/components/ToggleRow';
import { Theme } from '@/core/theme/types';

interface Props {
  icon?: React.ComponentProps<typeof Feather>['name'];
  label: string;
  sublabel?: string;
  value: boolean;
  disabled?: boolean;
  isLast?: boolean;
  onChange: (value: boolean) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    iconWrapper: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
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
  const styles = useMemo(() => createStyles(theme), [theme]);

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
