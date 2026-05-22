import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';

interface Props {
  icon?: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string;
  sublabel?: string;
  isLast?: boolean;
  destructive?: boolean;
  onPress: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
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
      marginRight: 12,
    },
    iconWrapperDestructive: {
      backgroundColor: theme.colors.errorLight,
    },
    textWrapper: { flex: 1 },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    labelDestructive: { color: theme.colors.error },
    sublabel: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    value: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
  });

export function SettingsSelectItem({
  icon,
  label,
  value,
  sublabel,
  isLast = false,
  destructive = false,
  onPress,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isLast && styles.rowLast,
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
    >
      {icon ? (
        <View
          style={[
            styles.iconWrapper,
            destructive && styles.iconWrapperDestructive,
          ]}
        >
          <Feather
            name={icon}
            size={16}
            color={destructive ? theme.colors.error : theme.colors.primary}
          />
        </View>
      ) : null}

      <View style={styles.textWrapper}>
        <Text
          style={[styles.label, destructive && styles.labelDestructive]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={styles.sublabel}>{sublabel}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {!destructive ? (
          <Feather
            name="chevron-right"
            size={16}
            color={theme.colors.textMuted}
          />
        ) : null}
      </View>
    </Pressable>
  );
}