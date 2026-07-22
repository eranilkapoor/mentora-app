import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

interface RemoveChipButtonProps {
  onPress: () => void;
  label: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function RemoveChipButton({
  onPress,
  label,
  size = 'sm',
  disabled = false,
}: RemoveChipButtonProps): React.ReactElement {
  const { theme } = useTheme();

  const dim = size === 'md' ? 20 : 16;
  const iconSize = size === 'md' ? 11 : 9;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      // hitSlop extends touch area to 44pt without changing visual size
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.button,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: theme.colors.primary,
        },
        disabled && styles.disabled,
      ]}
    >
      <Feather name="x" size={iconSize} color={theme.colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
