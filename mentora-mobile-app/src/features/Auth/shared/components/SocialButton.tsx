import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { authSharedStyles } from '../auth.styles';
import { SocialButtonProps } from '../auth.types';

export const SocialButton = React.memo<SocialButtonProps>(
  ({ label, onPress, disabled = false, icon, iconColor }) => {
    const styles = useThemedStyles(authSharedStyles);
    const { theme } = useTheme();

    return (
      <TouchableOpacity
        style={[styles.socialButton, disabled && styles.disabledButton]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <Feather
          name={icon}
          size={20}
          color={iconColor ?? theme.colors.textSecondary}
          style={styles.socialIcon}
        />
        <Text style={styles.socialLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }
);

SocialButton.displayName = 'SocialButton';
